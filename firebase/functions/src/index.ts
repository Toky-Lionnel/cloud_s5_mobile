import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const notifyStatusChange = functions.firestore.onDocumentUpdated(
  "signalements/{signalementId}",
  async (event) => {
    const change = event.data;
    const context = event;

    if (!change) return null;

    const before = change.before.data();
    const after = change.after.data();

    // Vérifier si le statut a changé
    if (before.idStatus === after.idStatus) return null;

    const userId = after.idUser;
    const updatedAt = after.updatedAt?.toDate?.() || new Date();
    const status = after.status;

    // Récupérer le token de l'utilisateur
    const userDoc = await db.collection("users").doc(userId).get();
    const fcmToken = userDoc.get("fcmToken");

    if (!fcmToken) {
      console.log(`Aucun token pour l'utilisateur ${userId}`);
      return null;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: "Mise à jour de votre signalement",
        body: `Le statut de votre signalement est maintenant
         "${status}" (${updatedAt.toLocaleString()})`,
      },
      data: {
        idStatus: after.idStatus.toString(),
        signalementId: context.params.signalementId,
      },
    };

    try {
      await admin.messaging().send(message);
      console.log("Notification envoyée à", userId);
    } catch (error) {
      console.error("Erreur envoi FCM:", error);
    }

    return null;
  });
