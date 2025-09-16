// hooks/useDepartmentIssues.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';

interface DepartmentIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  assignedDepartment: string;
  assignedTo?: string;
  departmentComments?: Array<{
    id: string;
    comment: string;
    timestamp: any;
    author: string;
    type: 'status_update' | 'comment' | 'resolution';
  }>;
  images?: string[];
  beforeAfterImages?: {
    before: string[];
    after: string[];
  };
}

export const useDepartmentIssues = () => {
  const { user } = useDepartmentAuth();
  const [issues, setIssues] = useState<DepartmentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.department) {
      setLoading(false);
      return;
    }

    console.log('🏢 Loading issues for department:', user.department);

    // Map department names to Firebase categories
    const departmentToCategory = {
      'Public Works': 'roads',
      'Water & Utilities': 'water',       // ✅ Fixed
      'Street Lighting': 'lighting',
      'Waste Management': 'waste'
    };

    const category = departmentToCategory[user.department as keyof typeof departmentToCategory];
    
    if (!category) {
      console.log('❌ Unknown department:', user.department);
      setError('Unknown department category');
      setLoading(false);
      return;
    }

    const issuesRef = collection(db, 'reports');
    const q = query(
      issuesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('📋 Issues received for', user.department, ':', snapshot.docs.length);
        
        const departmentIssues: DepartmentIssue[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Processing issue:', data.title, 'Category:', data.category);
          
          const issue: DepartmentIssue = {
            id: doc.id,
            title: data.title || 'Untitled Issue',
            description: data.description || '',
            category: data.category || 'other',
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            location: {
              latitude: data.location?.lat || 0,
              longitude: data.location?.lng || 0,
              address: data.location?.address || 'Unknown Location'
            },
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            resolvedAt: data.resolvedAt,
            userId: data.userId || '',
            userEmail: data.userEmail || '',
            userDisplayName: data.userDisplayName || 'Unknown User',
            assignedDepartment: data.assignedDepartment || user.department,
            assignedTo: data.assignedTo,
            departmentComments: data.departmentComments || [],
            images: data.imageUrls || [],
            beforeAfterImages: data.beforeAfterImages || { before: [], after: [] }
          };
          
          departmentIssues.push(issue);
        });
        
        setIssues(departmentIssues);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error loading department issues:', err);
        setError('Failed to load issues');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.department]);

  // Update issue status
  const updateIssueStatus = async (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved', comment?: string) => {
    if (!user) return;

    try {
      const issueRef = doc(db, 'reports', issueId);
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }

      if (comment) {
        const newComment = {
          id: Date.now().toString(),
          comment,
          timestamp: serverTimestamp(),
          author: user.displayName,
          type: newStatus === 'resolved' ? 'resolution' : 'status_update'
        };

        updateData.departmentComments = [
          ...issues.find(i => i.id === issueId)?.departmentComments || [],
          newComment
        ];
      }

      await updateDoc(issueRef, updateData);
      console.log('✅ Issue status updated:', issueId, '→', newStatus);
      
      return true;
    } catch (error) {
      console.error('❌ Error updating issue:', error);
      throw error;
    }
  };

  // Add comment to issue
  const addComment = async (issueId: string, comment: string) => {
    if (!user) return;

    try {
      const issueRef = doc(db, 'reports', issueId);
      const newComment = {
        id: Date.now().toString(),
        comment,
        timestamp: serverTimestamp(),
        author: user.displayName,
        type: 'comment'
      };

      const existingComments = issues.find(i => i.id === issueId)?.departmentComments || [];
      
      await updateDoc(issueRef, {
        departmentComments: [...existingComments, newComment],
        updatedAt: serverTimestamp()
      });

      console.log('✅ Comment added to issue:', issueId);
      return true;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    todayResolved: issues.filter(i => {
      if (!i.resolvedAt) return false;
      const today = new Date();
      const resolvedDate = i.resolvedAt.toDate();
      return resolvedDate.toDateString() === today.toDateString();
    }).length
  };

  return { 
    issues, 
    loading, 
    error, 
    updateIssueStatus, 
    addComment, 
    stats 
  };
};
