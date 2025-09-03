"use client";

import { NotificationsStorage } from '@/utils/profileStorage';

export const notificationsService = {
  async getNotifications(userId: string) {
    return NotificationsStorage.getNotifications(userId);
  },

  async getUnreadCount(userId: string) {
    const list = await NotificationsStorage.getNotifications(userId);
    return list.filter(n => !n.read).length;
  },

  async markAsRead(userId: string, notificationId: string) {
    await NotificationsStorage.markAsRead(userId, [notificationId]);
    return true;
  },

  async delete(userId: string, notificationId: string) {
    await NotificationsStorage.deleteNotification(userId, notificationId);
    return true;
  },

  async markAllAsRead(userId: string) {
    const list = await NotificationsStorage.getNotifications(userId);
    const ids = list.filter(n => !n.read).map(n => n.id);
    if (ids.length > 0) {
      await NotificationsStorage.markAsRead(userId, ids);
    }
    return true;
  }
};