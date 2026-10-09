package com.tripwonder.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(UpdateNotifierPlugin.class);
        super.onCreate(savedInstanceState);
        applyPrototypeTextScale();
        preferHighRefreshRate();
        requestNotificationPermission();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Tapping "新版页面已就绪" while the app is running: switch to the downloaded bundle now.
        // From a cold start the plugin already boots into the pending bundle, so nothing to do there.
        if (intent != null && intent.getBooleanExtra(UpdateNotifierPlugin.EXTRA_APPLY_UPDATE, false) && bridge != null) {
            bridge.triggerWindowJSEvent("tripwonderapplyupdate");
        }
    }

    private void requestNotificationPermission() {
        // Android 13+ asks once; declining only hides the update progress notification.
        if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[] {Manifest.permission.POST_NOTIFICATIONS}, 4201);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        applyPrototypeTextScale();
        preferHighRefreshRate();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyPrototypeTextScale();
        preferHighRefreshRate();
    }

    private void applyPrototypeTextScale() {
        // Match the HTML prototype's CSS sizes without changing device density,
        // system font settings, viewport scale, or the scene's pinch gestures.
        if (bridge != null && bridge.getWebView() != null) {
            var settings = bridge.getWebView().getSettings();
            if (settings.getTextZoom() != 100) settings.setTextZoom(100);
        }
    }

    private void preferHighRefreshRate() {
        // Only request the refresh rate. Keep the display's current resolution
        // and let Android honor the user's battery and display policies.
        Display display = getWindow().getDecorView().getDisplay();
        if (display == null) return;
        Display.Mode current = display.getMode();
        float preferred = 0f;
        float fastest = 0f;
        for (Display.Mode mode : display.getSupportedModes()) {
            if (mode.getPhysicalWidth() != current.getPhysicalWidth()
                    || mode.getPhysicalHeight() != current.getPhysicalHeight()) continue;
            float rate = mode.getRefreshRate();
            fastest = Math.max(fastest, rate);
            if (rate <= 120.5f) preferred = Math.max(preferred, rate);
        }
        // A 90 Hz panel requests 90; a 120 Hz panel requests 120. For panels
        // exposing only 60 and 144, prefer 144 rather than falling back to 60.
        if (preferred <= 60.5f && fastest > 60.5f) preferred = fastest;
        if (preferred <= 60.5f) preferred = 0f;
        WindowManager.LayoutParams params = getWindow().getAttributes();
        if (params.preferredRefreshRate != preferred || params.preferredDisplayModeId != 0) {
            params.preferredDisplayModeId = 0;
            params.preferredRefreshRate = preferred;
            getWindow().setAttributes(params);
        }
    }
}
