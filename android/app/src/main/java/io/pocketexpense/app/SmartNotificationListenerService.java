package io.pocketexpense.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.text.TextUtils;

public class SmartNotificationListenerService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        Notification notification = sbn.getNotification();
        if (notification == null || notification.extras == null) {
            return;
        }

        Bundle extras = notification.extras;
        String title = charSequenceToString(extras.getCharSequence(Notification.EXTRA_TITLE));
        String text = charSequenceToString(extras.getCharSequence(Notification.EXTRA_TEXT));
        String bigText = charSequenceToString(extras.getCharSequence(Notification.EXTRA_BIG_TEXT));
        String body = !TextUtils.isEmpty(bigText) ? bigText : text;

        SmartDetectionPlugin.emitNotification(
            sbn.getPackageName(),
            title,
            body,
            sbn.getPostTime()
        );
    }

    private String charSequenceToString(CharSequence value) {
        return value == null ? "" : value.toString();
    }
}
