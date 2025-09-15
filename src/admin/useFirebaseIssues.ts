// admin/useFirebaseIssues.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust path to your Firebase config

interface FirebaseIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved'; // Only these 3 statuses
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: any; // Firebase Timestamp
  resolvedAt?: any; // Firebase Timestamp
  userId: string;
  assignedTo?: string;
  department?: string;
}

export const useFirebaseIssues = () => {
  const [issues, setIssues] = useState<FirebaseIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 Setting up Firebase issues listener...');
    
    const issuesRef = collection(db, 'reports'); // Your collection name
    const q = query(issuesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('📊 Firebase issues received, docs:', snapshot.docs.length);
        
        // Log first document to see structure
        if (snapshot.docs.length > 0) {
          console.log('📋 First document data:', snapshot.docs[0].data());
        }
        
        const issueData: FirebaseIssue[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Only include the 3 specific statuses
          const validStatuses = ['pending', 'in-progress', 'resolved'];
          const issueStatus = data.status || 'pending';
          
          if (!validStatuses.includes(issueStatus)) {
            console.log('⚠️ Skipping invalid status:', issueStatus, 'for doc:', doc.id);
            return; // Skip this issue if status is not one of our 3
          }
          
          // Debug location data
          console.log('🗺️ Processing document:', doc.id, {
            title: data.title,
            hasLocation: !!data.location,
            locationStructure: data.location,
            lat: data.location?.lat,
            lng: data.location?.lng,
            address: data.location?.address,
            fullLocation: data.location?.fullLocation
          });
          
          // Map your existing Firebase structure to the expected format
          const mappedIssue: FirebaseIssue = {
            id: doc.id,
            title: data.title || 'Untitled Issue',
            description: data.description || '',
            category: data.category || 'other',
            status: issueStatus as 'pending' | 'in-progress' | 'resolved',
            priority: data.priority || 'medium',
            location: {
              // YOUR EXACT FIREBASE STRUCTURE
              latitude: data.location?.lat || 0,        // ✅ lat field from your form
              longitude: data.location?.lng || 0,       // ✅ lng field from your form
              address: data.location?.address ||        // ✅ address field from your form
                      data.location?.fullLocation?.displayAddress || 
                      data.location?.fullLocation?.fullAddress || 
                      'Unknown Location'
            },
            createdAt: data.createdAt,
            resolvedAt: data.updatedAt && data.status === 'resolved' ? data.updatedAt : undefined,
            userId: data.userId || '',
            assignedTo: data.assignedTo,
            department: data.assignedDepartment
          };
          
          console.log('✅ Mapped issue location:', {
            id: doc.id,
            title: mappedIssue.title,
            status: mappedIssue.status,
            lat: mappedIssue.location.latitude,
            lng: mappedIssue.location.longitude,
            address: mappedIssue.location.address,
            hasValidLocation: !!(mappedIssue.location.latitude && mappedIssue.location.longitude)
          });
          
          // Only include issues with valid location data
          if (mappedIssue.location.latitude && mappedIssue.location.longitude && 
              mappedIssue.location.latitude !== 0 && mappedIssue.location.longitude !== 0) {
            issueData.push(mappedIssue);
            console.log('✅ Added issue to map:', doc.id);
          } else {
            console.log('❌ Skipping issue without valid location:', doc.id, data.title, {
              lat: data.location?.lat,
              lng: data.location?.lng
            });
          }
        });
        
        console.log('🎯 Final issues with location:', issueData.length);
        console.log('📍 Issue locations:', issueData.map(i => ({
          id: i.id,
          title: i.title,
          lat: i.location.latitude,
          lng: i.location.longitude,
          status: i.status
        })));
        
        setIssues(issueData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error fetching issues:', err);
        setError('Failed to load issues from Firebase');
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up Firebase issues listener');
      unsubscribe();
    };
  }, []);

  return { issues, loading, error };
};

// Hook for resolved issues specifically
export const useResolvedIssues = (timeRange?: string) => {
  const [resolvedIssues, setResolvedIssues] = useState<FirebaseIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📈 Setting up resolved issues listener for timeRange:', timeRange);
    
    const issuesRef = collection(db, 'reports');
    const q = query(issuesRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issues: FirebaseIssue[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Only resolved issues
        if (data.status !== 'resolved') return;
        
        // Apply time range filter if specified
        if (timeRange && data.updatedAt) {
          const resolvedDate = data.updatedAt.toDate();
          const now = new Date();
          const daysDiff = (now.getTime() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24);
          
          switch (timeRange) {
            case '7days':
              if (daysDiff > 7) return;
              break;
            case '30days':
              if (daysDiff > 30) return;
              break;
            case '90days':
              if (daysDiff > 90) return;
              break;
          }
        }
        
        const mappedIssue: FirebaseIssue = {
          id: doc.id,
          title: data.title || 'Untitled Issue',
          description: data.description || '',
          category: data.category || 'other',
          status: 'resolved',
          priority: data.priority || 'medium',
          location: {
            latitude: data.location?.lat || 0,
            longitude: data.location?.lng || 0,
            address: data.location?.address || 
                    data.location?.fullLocation?.displayAddress || 
                    'Unknown Location'
          },
          createdAt: data.createdAt,
          resolvedAt: data.updatedAt,
          userId: data.userId || '',
          assignedTo: data.assignedTo,
          department: data.assignedDepartment
        };
        
        // Only include issues with valid location data
        if (mappedIssue.location.latitude && mappedIssue.location.longitude &&
            mappedIssue.location.latitude !== 0 && mappedIssue.location.longitude !== 0) {
          issues.push(mappedIssue);
        }
      });
      
      setResolvedIssues(issues);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching resolved issues:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [timeRange]);

  return { resolvedIssues, loading };
};

// Hook for issue statistics (only 3 statuses)
export const useIssueStats = () => {
  const { issues, loading } = useFirebaseIssues();
  
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    byCategory: issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    locations: issues.map(issue => ({
      id: issue.id,
      lat: issue.location.latitude,
      lng: issue.location.longitude,
      status: issue.status
    }))
  };
  
  console.log('📊 Issue stats:', stats);
  
  return { stats, loading };
};
