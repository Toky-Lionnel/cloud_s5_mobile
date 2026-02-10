package com.example.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import android.util.Log;
import java.util.HashMap;
import java.util.Map;


public class MainActivity extends BridgeActivity {

  @Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    try {
        FirebaseApp.initializeApp(this);
        Log.d("FirebaseTest", "✅ Firebase initialisé avec succès");
    } catch (Exception e) {
        Log.e("FirebaseTest", "❌ Erreur Firebase: ", e);
    }
}

}
