package com.tripwonder.app;

import android.content.res.Configuration;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyPrototypeTextScale();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyPrototypeTextScale();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyPrototypeTextScale();
    }

    private void applyPrototypeTextScale() {
        // Match the HTML prototype's CSS sizes without changing device density,
        // system font settings, viewport scale, or the scene's pinch gestures.
        if (bridge != null && bridge.getWebView() != null) {
            var settings = bridge.getWebView().getSettings();
            if (settings.getTextZoom() != 100) settings.setTextZoom(100);
        }
    }
}
