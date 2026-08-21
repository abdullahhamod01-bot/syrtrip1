import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/notifications_controller.dart';
import '../providers/app_provider.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';

class NotificationsView extends StatefulWidget {
  const NotificationsView({super.key});

  @override
  State<NotificationsView> createState() => _NotificationsViewState();
}

class _NotificationsViewState extends State<NotificationsView> {
  List<Map<String, dynamic>> notifications = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final data = await NotificationsController.getNotifications();
    if (mounted) {
      setState(() {
        notifications = data;
        isLoading = false;
      });
    }
  }

  String _value(Map<String, dynamic> notification, List<String> keys) {
    for (final key in keys) {
      final value = notification[key]?.toString().trim();
      if (value != null && value.isNotEmpty) return value;
    }
    return '';
  }

  bool _isRead(Map<String, dynamic> notification) {
    final value = notification['isRead'] ?? notification['read'];
    return value == true || value?.toString().toLowerCase() == 'true';
  }

  Future<void> _markAsRead(int index) async {
    final notification = notifications[index];
    final id = _value(notification, ['id', '_id', 'notificationId']);
    if (id.isEmpty || _isRead(notification)) return;

    final success = await NotificationsController.markAsRead(id);
    if (success && mounted) {
      setState(() {
        notifications[index] = {...notification, 'isRead': true};
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isArabic = context.watch<AppProvider>().isArabic;

    return Scaffold(
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadNotifications,
              child: notifications.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: 500,
                          child: Center(
                            child: Text(
                              isArabic
                                  ? 'لا توجد إشعارات حالياً'
                                  : 'No notifications yet',
                            ),
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: notifications.length,
                      itemBuilder: (context, index) {
                        final notification = notifications[index];
                        final title = _value(notification, [
                          'title',
                          'subject',
                        ]);
                        final body = _value(notification, [
                          'body',
                          'message',
                          'content',
                        ]);
                        final read = _isRead(notification);

                        return Card(
                          color: read
                              ? colorScheme.surface
                              : (theme.brightness == Brightness.dark
                                    ? const Color(0xFF1B3A25)
                                    : const Color(0xFFE8F5E9)),
                          child: ListTile(
                            leading: Icon(
                              read
                                  ? Icons.notifications_none
                                  : Icons.notifications_active,
                              color: const Color(0xFF2E7D63),
                            ),
                            title: Text(
                              title.isEmpty
                                  ? (isArabic ? 'إشعار' : 'Notification')
                                  : title,
                              style: TextStyle(
                                fontWeight: read
                                    ? FontWeight.normal
                                    : FontWeight.bold,
                              ),
                            ),
                            subtitle: body.isEmpty ? null : Text(body),
                            onTap: () => _markAsRead(index),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
