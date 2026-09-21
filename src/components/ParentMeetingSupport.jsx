import React from 'react';
import { StorageService } from '../services/storage';
import { ParentMeetingManager } from './ParentMeetingManager';

export function ParentMeetingSupport({ currentUser }) {
  const teacherId = currentUser?.id || 'guest_user';
  const classData = StorageService.getTeacherHomeroom(teacherId);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <ParentMeetingManager currentUser={currentUser} classData={classData} />
    </div>
  );
}
