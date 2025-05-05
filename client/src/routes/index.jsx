import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Home from '@/pages/home/Home';
import Categories from '@/pages/Categories';
import CategoryNotes from '@/pages/CategoryNotes';
import Notes from '@/pages/Notes';
import Note from '@/pages/Note';
import CreateNote from '@/pages/CreateNote';
import EditNote from '@/pages/EditNote';
import Search from '@/pages/Search';
import AiChat from '@/pages/ai/AiChat';
import AiOcr from '@/pages/ai/AiOcr';
import TodoList from '@/pages/todolist/TodoList';
import DrawingList from '@/pages/drawingboard/DrawingList';
import DrawingCreate from '@/pages/drawingboard/DrawingCreate';
import DrawingDetail from '@/pages/drawingboard/DrawingDetail';
import Community from '@/pages/community/Community';
import CommunityNote from '@/pages/community/CommunityNote';
import MyLikeNotes from '@/pages/home/MyLikeNotes';
import MyCollectNotes from '@/pages/home/MyCollectNotes';
import MyCommentNotes from '@/pages/home/MyCommentNotes';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/search" element={<Search />} />
      <Route path="/ai/chat" element={<AiChat />} />
      <Route path="/ai/ocr" element={<AiOcr />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/notes/categories/:categoryId" element={<CategoryNotes />} />
      {/* <Route path="/notes" element={<Notes />} /> */}
      <Route path="/notes/:id" element={<Note />} />
      <Route path="/create-note" element={<CreateNote />} />
      <Route path="/notes/edit/:noteId" element={<EditNote />} />
      <Route path="/todoList" element={<TodoList />} />
      <Route path="/drawing" element={<DrawingList />} />
      <Route path="/drawing-create" element={<DrawingCreate />} />
      <Route path="/drawing-detail/:id" element={<DrawingDetail />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/note/:id" element={<CommunityNote />} />
      <Route path="/home/like-note/:userId" element={<MyLikeNotes />} />
      <Route path="/home/collect-note/:userId" element={<MyCollectNotes />} />
      <Route path="/home/comment-note/:userId" element={<MyCommentNotes />} />
    </Routes>
  );
};

export default AppRoutes;
