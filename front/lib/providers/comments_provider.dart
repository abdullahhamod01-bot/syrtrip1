import 'package:flutter/material.dart';

//لعمل تحديث للصفحة في حال كتابة كومنت
class Comment {
  final String userName;
  final String userImage;
  final String text;
  final int stars;

  Comment({required this.userName, required this.userImage, required this.text, required this.stars});
}

class CommentsProvider with ChangeNotifier {
  final Map<String, List<Comment>> _comments = {};

  List<Comment> getComments(String id) => _comments[id] ?? [];

  void addComment(String id, Comment comment) {
    _comments.putIfAbsent(id, () => []).add(comment);
    notifyListeners();
  }

  void deleteComment(String id, int index) {
    _comments[id]?.removeAt(index);
    notifyListeners();
  }
}
