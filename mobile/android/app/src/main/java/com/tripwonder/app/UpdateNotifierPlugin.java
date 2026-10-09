package com.tripwonder.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Status-bar notification for live updates: a progress bar while the new web bundle downloads,
 * then a tap-to-apply notification. Tapping it re-opens MainActivity with EXTRA_APPLY_UPDATE.
 */
@CapacitorPlugin(name = "UpdateNotifier")
public class UpdateNotifierPlugin extends Plugin {
    static final String EXTRA_APPLY_UPDATE = "com.tripwonder.app.APPLY_UPDATE";
    private static final String CHANNEL_ID = "tripwonder-updates";
    private static final int NOTIFICATION_ID = 4201;

    @Override
    public void load() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "页面更新", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("新版页面的下载进度与安装提示");
            channel.setShowBadge(false);
            getContext().getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    @PluginMethod
    public void progress(PluginCall call) {
        int percent = Math.max(0, Math.min(100, call.getInt("percent", 0)));
        boolean indeterminate = call.getBoolean("indeterminate", false);
        NotificationCompat.Builder builder = base(false)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentTitle(call.getString("title", "正在拉取新版页面"))
            .setContentText(call.getString("text", percent + "%"))
            .setSubText(indeterminate ? null : percent + "%")
            .setProgress(100, percent, indeterminate)
            .setOngoing(true)
            .setOnlyAlertOnce(true);
        show(builder);
        call.resolve();
    }

    @PluginMethod
    public void finish(PluginCall call) {
        boolean apply = call.getBoolean("apply", false);
        NotificationCompat.Builder builder = base(apply)
            .setSmallIcon(apply ? android.R.drawable.stat_sys_download_done : android.R.drawable.stat_notify_error)
            .setContentTitle(call.getString("title", "新版页面已就绪"))
            .setContentText(call.getString("text", "点按立即使用新版页面"))
            .setStyle(new NotificationCompat.BigTextStyle().bigText(call.getString("text", "点按立即使用新版页面")))
            .setProgress(0, 0, false)
            .setOngoing(false)
            .setAutoCancel(true);
        show(builder);
        call.resolve();
    }

    @PluginMethod
    public void clear(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        call.resolve();
    }

    private NotificationCompat.Builder base(boolean apply) {
        Context context = getContext();
        Intent intent = new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (apply) intent.putExtra(EXTRA_APPLY_UPDATE, true);
        PendingIntent open = PendingIntent.getActivity(context, apply ? 1 : 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(context, CHANNEL_ID)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setContentIntent(open)
            .setColor(0xFF315EFF);
    }

    private void show(NotificationCompat.Builder builder) {
        Context context = getContext();
        // Android 13+: without the runtime permission the update still downloads; only the notification is skipped.
        if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
    }
}
