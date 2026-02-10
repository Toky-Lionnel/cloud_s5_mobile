package com.example.app;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "FCM_SERVICE";

    /**
     * Appelé à chaque fois qu'un nouveau token est généré/rafraîchi
     */
    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Nouveau token FCM généré: " + token);

        // Envoyer le token au serveur si nécessaire
        sendTokenToServer(token);
    }

    /**
     * Appelé lorsqu'un message est reçu
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Log.d(TAG, "Message reçu de: " + remoteMessage.getFrom());

        // Vérifier si le message contient un titre et un corps
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Titre: " + remoteMessage.getNotification().getTitle());
            Log.d(TAG, "Corps: " + remoteMessage.getNotification().getBody());
        }

        // Vérifier les données personnalisées
        if (!remoteMessage.getData().isEmpty()) {
            Log.d(TAG, "Données du message: " + remoteMessage.getData());
        }
    }

    /**
     * Envoyer le token au serveur de backend (optionnel)
     */
    private void sendTokenToServer(String token) {
        // Implémentez cela selon votre backend
        Log.d(TAG, "Token à envoyer au serveur: " + token);
    }
}
