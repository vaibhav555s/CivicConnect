// hooks/useDepartmentIssues.ts - FIXED EXPORT
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  assignedAt?: any;
  assignedBy?: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  assignedDepartment: string;
  isNewAssignment?: boolean;
  departmentNotified?: boolean;
  assignmentHistory?: Array<{
    department: string;
    assignedBy: string;
    assignedAt: any;
    reason: string;
  }>;
  departmentComments?: Array<{
    id: string;
    comment: string;
    timestamp: any;
    author: string;
    type: 'status_update' | 'comment' | 'resolution';
  }>;
  imageUrls?: string[];
  beforeAfterImages?: {
    before: string[];
    after: string[];
  };
}

interface WeeklyData {
  week: string;
  weekStart: Date;
  resolved: number;
  pending: number;
  inProgress: number;
  assigned: number;
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  resolved: number;
  pending: number;
  avgResolutionTime: number;
}

interface PerformanceMetrics {
  thisMonth: {
    resolved: number;
    pending: number;
    inProgress: number;
    avgResolutionTime: number;
    satisfactionScore: number;
    responseTime: number;
    totalAssigned: number;
  };
  lastMonth: {
    resolved: number;
    pending: number;
    inProgress: number;
    avgResolutionTime: number;
    satisfactionScore: number;
    responseTime: number;
    totalAssigned: number;
  };
  weeklyTrends: WeeklyData[];
  categoryBreakdown: CategoryData[];
}

// ✅ PROPERLY EXPORTED HOOK
export const useDepartmentIssues = () => {
  const { user } = useDepartmentAuth();
  const [issues, setIssues] = useState<DepartmentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAssignmentCount, setNewAssignmentCount] = useState(0);

  useEffect(() => {
    if (!user?.department) {
      console.log('❌ No department found for user:', user);
      setLoading(false);
      return;
    }

    console.log('🏢 Setting up REAL-TIME listener for department:', user.department);

    // Real-time query for department-specific issues
    const issuesRef = collection(db, 'reports');
    const q = query(
      issuesRef,
      where('assignedDepartment', '==', user.department)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('🔥 REAL-TIME UPDATE for', user.department, ':', snapshot.docs.length, 'issues');
        
        const departmentIssues: DepartmentIssue[] = [];
        let newCount = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check for new assignments (not yet notified)
          if (data.isNewAssignment && !data.departmentNotified) {
            newCount++;
            
            // Mark as notified to avoid repeat notifications
            updateDoc(doc.ref, {
              departmentNotified: true,
              isNewAssignment: false
            }).catch(console.error);
          }
          
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
            assignedAt: data.assignedAt,
            assignedBy: data.assignedBy,
            userId: data.userId || '',
            userEmail: data.userEmail || '',
            userDisplayName: data.userDisplayName || 'Unknown User',
            assignedDepartment: data.assignedDepartment || user.department,
            isNewAssignment: data.isNewAssignment || false,
            departmentNotified: data.departmentNotified || false,
            assignmentHistory: data.assignmentHistory || [],
            departmentComments: data.departmentComments || [],
            imageUrls: data.imageUrls || [],
            beforeAfterImages: data.beforeAfterImages || { before: [], after: [] }
          };
          
          departmentIssues.push(issue);
        });
        
        // Sort by newest first
        departmentIssues.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        console.log('✅ Department issues updated:', departmentIssues.length, 'total,', newCount, 'new');
        setIssues(departmentIssues);
        setNewAssignmentCount(newCount);
        setLoading(false);
        setError(null);
        
        // Show browser notification for new assignments
        if (newCount > 0 && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`🔔 CivicConnect - New Assignment`, {
              body: `${newCount} new issue${newCount > 1 ? 's' : ''} assigned to ${user.department}`,
              icon: '/favicon.ico',
              tag: 'new-assignment',
              requireInteraction: true
            });
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification(`🔔 CivicConnect - New Assignment`, {
                  body: `${newCount} new issue${newCount > 1 ? 's' : ''} assigned to ${user.department}`,
                  icon: '/favicon.ico',
                  tag: 'new-assignment'
                });
              }
            });
          }
        }
      },
      (err) => {
        console.error('❌ Real-time listener error:', err);
        setError('Failed to load issues: ' + err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up department real-time listener');
      unsubscribe();
    };
  }, [user?.department]);

  // Update issue status
  const updateIssueStatus = async (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved', comment?: string) => {
    if (!user) return;

    try {
      const issueRef = doc(db, 'reports', issueId);
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        isNewAssignment: false,
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

  // 📊 DYNAMIC ANALYTICS CALCULATIONS
  const calculateAnalytics = (): PerformanceMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Helper function to get date ranges
    const getMonthRange = (monthOffset: number) => {
      const date = new Date(currentYear, currentMonth + monthOffset, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    };

    const thisMonthRange = getMonthRange(0);
    const lastMonthRange = getMonthRange(-1);

    // Filter issues by month
    const thisMonthIssues = issues.filter(issue => {
      if (!issue.assignedAt) return false;
      const assignedDate = issue.assignedAt.toDate();
      return assignedDate >= thisMonthRange.start && assignedDate <= thisMonthRange.end;
    });

    const lastMonthIssues = issues.filter(issue => {
      if (!issue.assignedAt) return false;
      const assignedDate = issue.assignedAt.toDate();
      return assignedDate >= lastMonthRange.start && assignedDate <= lastMonthRange.end;
    });

    // Calculate average resolution time
    const calculateAvgResolutionTime = (issuesList: DepartmentIssue[]) => {
      const resolvedIssues = issuesList.filter(issue => issue.resolvedAt && issue.assignedAt);
      if (resolvedIssues.length === 0) return 0;
      
      const totalTime = resolvedIssues.reduce((sum, issue) => {
        const assigned = issue.assignedAt.toDate().getTime();
        const resolved = issue.resolvedAt.toDate().getTime();
        return sum + (resolved - assigned);
      }, 0);
      
      return Math.round((totalTime / resolvedIssues.length) / (1000 * 60 * 60 * 24 * 10)) / 10; // Days with 1 decimal
    };

    // Calculate satisfaction score (mock based on resolution rate and speed)
    const calculateSatisfactionScore = (issuesList: DepartmentIssue[]) => {
      const resolved = issuesList.filter(i => i.status === 'resolved').length;
      const total = issuesList.length;
      if (total === 0) return 4.0;
      
      const resolutionRate = resolved / total;
      const avgTime = calculateAvgResolutionTime(issuesList);
      
      // Score based on resolution rate and speed (1-5 scale)
      let score = 3.0 + (resolutionRate * 1.5); // Base score from resolution rate
      if (avgTime > 0 && avgTime < 3) score += 0.5; // Bonus for fast resolution
      if (avgTime > 7) score -= 0.3; // Penalty for slow resolution
      
      return Math.min(5.0, Math.max(1.0, Math.round(score * 10) / 10));
    };

    // Calculate response time (time from assignment to first status change)
    const calculateResponseTime = (issuesList: DepartmentIssue[]) => {
      const respondedIssues = issuesList.filter(issue => 
        issue.assignedAt && (issue.status !== 'pending' || issue.departmentComments?.length > 0)
      );
      
      if (respondedIssues.length === 0) return 0;
      
      // Mock calculation - in real app you'd track first response timestamps
      const avgResolutionTime = calculateAvgResolutionTime(issuesList);
      return Math.max(0.5, avgResolutionTime * 0.3); // Response time is typically 30% of resolution time
    };

    // Calculate weekly trends (last 4 weeks)
    const calculateWeeklyTrends = (): WeeklyData[] => {
      const weeks: WeeklyData[] = [];
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekIssues = issues.filter(issue => {
          if (!issue.assignedAt) return false;
          const assignedDate = issue.assignedAt.toDate();
          return assignedDate >= weekStart && assignedDate <= weekEnd;
        });
        
        weeks.push({
          week: `Week ${4 - i}`,
          weekStart,
          resolved: weekIssues.filter(i => i.status === 'resolved').length,
          pending: weekIssues.filter(i => i.status === 'pending').length,
          inProgress: weekIssues.filter(i => i.status === 'in-progress').length,
          assigned: weekIssues.length
        });
      }
      
      return weeks;
    };

    // Calculate category breakdown
    const calculateCategoryBreakdown = (): CategoryData[] => {
      const categoryStats = new Map<string, {
        count: number;
        resolved: number;
        pending: number;
        resolutionTimes: number[];
      }>();

      thisMonthIssues.forEach(issue => {
        const category = issue.category || 'other';
        const current = categoryStats.get(category) || {
          count: 0,
          resolved: 0,
          pending: 0,
          resolutionTimes: []
        };

        current.count++;
        if (issue.status === 'resolved') {
          current.resolved++;
          if (issue.assignedAt && issue.resolvedAt) {
            const resolutionTime = (issue.resolvedAt.toDate().getTime() - issue.assignedAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
            current.resolutionTimes.push(resolutionTime);
          }
        }
        if (issue.status === 'pending') current.pending++;

        categoryStats.set(category, current);
      });

      const total = thisMonthIssues.length;
      const categories: CategoryData[] = [];

      categoryStats.forEach((stats, category) => {
        const avgResolutionTime = stats.resolutionTimes.length > 0
          ? stats.resolutionTimes.reduce((a, b) => a + b, 0) / stats.resolutionTimes.length
          : 0;

        categories.push({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count: stats.count,
          percentage: total > 0 ? Math.round((stats.count / total) * 100) : 0,
          resolved: stats.resolved,
          pending: stats.pending,
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
        });
      });

      return categories.sort((a, b) => b.count - a.count);
    };

    return {
      thisMonth: {
        resolved: thisMonthIssues.filter(i => i.status === 'resolved').length,
        pending: thisMonthIssues.filter(i => i.status === 'pending').length,
        inProgress: thisMonthIssues.filter(i => i.status === 'in-progress').length,
        avgResolutionTime: calculateAvgResolutionTime(thisMonthIssues),
        satisfactionScore: calculateSatisfactionScore(thisMonthIssues),
        responseTime: calculateResponseTime(thisMonthIssues),
        totalAssigned: thisMonthIssues.length
      },
      lastMonth: {
        resolved: lastMonthIssues.filter(i => i.status === 'resolved').length,
        pending: lastMonthIssues.filter(i => i.status === 'pending').length,
        inProgress: lastMonthIssues.filter(i => i.status === 'in-progress').length,
        avgResolutionTime: calculateAvgResolutionTime(lastMonthIssues),
        satisfactionScore: calculateSatisfactionScore(lastMonthIssues),
        responseTime: calculateResponseTime(lastMonthIssues),
        totalAssigned: lastMonthIssues.length
      },
      weeklyTrends: calculateWeeklyTrends(),
      categoryBreakdown: calculateCategoryBreakdown()
    };
  };

  // Basic stats
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    newAssignments: newAssignmentCount,
    todayAssigned: issues.filter(i => {
      if (!i.assignedAt) return false;
      const today = new Date();
      const assignedDate = i.assignedAt.toDate();
      return assignedDate.toDateString() === today.toDateString();
    }).length,
    todayResolved: issues.filter(i => {
      if (!i.resolvedAt) return false;
      const today = new Date();
      const resolvedDate = i.resolvedAt.toDate();
      return resolvedDate.toDateString() === today.toDateString();
    }).length
  };

  // Calculate analytics
  const analytics = calculateAnalytics();

  return { 
    issues, 
    loading, 
    error, 
    updateIssueStatus, 
    addComment, 
    stats,
    analytics // 🔥 Dynamic analytics data
  };
};

// ✅ EXPORT HOOK AS DEFAULT AS WELL (OPTIONAL)
export default useDepartmentIssues;
