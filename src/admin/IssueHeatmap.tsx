// admin/IssueHeatmap.tsx
import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
interface IssueLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
  category: string;
  resolvedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
}

interface HeatmapComponentProps {
  issues: IssueLocation[];
  filterOptions: {
    status: string;
    category: string;
    timeRange: string;
    showResolved: boolean;
    showPending: boolean;
    showInProgress: boolean;
  };
}

export const IssueHeatmap: React.FC<HeatmapComponentProps> = ({ issues, filterOptions }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<IssueLocation[]>([]);
  const [showMarkers, setShowMarkers] = useState(true); // Default to true to show markers

  // Filter issues
  useEffect(() => {
    console.log('🔍 Filtering', issues.length, 'issues with options:', filterOptions);
    
    const filtered = issues.filter(issue => {
      // Status filter
      if (filterOptions.status !== 'all' && issue.status !== filterOptions.status) return false;
      // Category filter
      if (filterOptions.category !== 'all' && issue.category !== filterOptions.category) return false;
      // Show/hide filters
      if (!filterOptions.showResolved && issue.status === 'resolved') return false;
      if (!filterOptions.showPending && issue.status === 'pending') return false;
      if (!filterOptions.showInProgress && issue.status === 'in-progress') return false;
      // Time range filter
      if (filterOptions.timeRange !== 'all' && issue.resolvedAt) {
        const resolvedDate = new Date(issue.resolvedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24);
        switch (filterOptions.timeRange) {
          case '7days': if (daysDiff > 7) return false; break;
          case '30days': if (daysDiff > 30) return false; break;
          case '90days': if (daysDiff > 90) return false; break;
        }
      }
      return true;
    });

    console.log('✅ Filtered to', filtered.length, 'issues');
    setFilteredIssues(filtered);
  }, [issues, filterOptions]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ Initializing map...');
    
    // Create map
    const map = L.map(mapRef.current).setView([19.0760, 72.8777], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    console.log('✅ Map initialized');

    return () => {
      if (mapInstanceRef.current) {
        console.log('🧹 Cleaning up map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smart Auto-Zoom Effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (filteredIssues.length === 0) {
      // No issues - show default Mumbai view
      map.setView([19.0760, 72.8777], 12);
      console.log('📍 No issues - showing default Mumbai view');
      return;
    }

    if (filteredIssues.length === 1) {
      // Single issue - center on it with medium zoom
      const issue = filteredIssues[0];
      map.setView([issue.latitude, issue.longitude], 16);
      console.log('📍 Single issue - centered with zoom 16');
      return;
    }

    // Multiple issues - fit bounds with smart padding
    try {
      const group = new L.FeatureGroup();
      
      filteredIssues.forEach(issue => {
        const marker = L.marker([issue.latitude, issue.longitude]);
        group.addLayer(marker);
      });

      const bounds = group.getBounds();
      
      // Calculate smart padding based on number of issues
      const padding = Math.max(20, Math.min(50, filteredIssues.length * 5));
      
      map.fitBounds(bounds, {
        padding: [padding, padding],
        maxZoom: filteredIssues.length > 10 ? 13 : 15 // Zoom out more if many issues
      });

      console.log(`📍 Auto-zoomed to fit ${filteredIssues.length} markers with ${padding}px padding`);

    } catch (error) {
      console.error('❌ Error auto-zooming map:', error);
      // Fallback to default view
      map.setView([19.0760, 72.8777], 12);
    }
  }, [filteredIssues]);

  // Update layers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || filteredIssues.length === 0) {
      console.log('⏳ Map not ready or no issues to display');
      return;
    }

    console.log('🔄 Updating map layers with', filteredIssues.length, 'issues');

    try {
      // Clear existing custom layers
      map.eachLayer((layer: any) => {
        if (layer._isCustomLayer) {
          map.removeLayer(layer);
        }
      });

      // Prepare heatmap data
      const heatData = filteredIssues.map(issue => {
        let intensity = 0.5;
        
        switch (issue.status) {
          case 'resolved': intensity = 0.8; break;
          case 'in-progress': intensity = 0.6; break;
          case 'pending': intensity = 0.4; break;
        }

        // Adjust for priority
        switch (issue.priority) {
          case 'critical': intensity *= 1.4; break;
          case 'high': intensity *= 1.2; break;
          case 'low': intensity *= 0.8; break;
        }

        return [issue.latitude, issue.longitude, Math.min(intensity, 1.0)];
      });

      // Add heatmap layer
      if (heatData.length > 0) {
        const heatLayer = (L as any).heatLayer(heatData, {
          radius: 30,
          blur: 20,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.2: '#3B82F6', // Blue
            0.4: '#EF4444', // Red (pending)
            0.6: '#F59E0B', // Amber (in-progress)
            1.0: '#10B981'  // Green (resolved)
          }
        });
        
        heatLayer._isCustomLayer = true;
        heatLayer.addTo(map);
        console.log('🔥 Heatmap added with', heatData.length, 'points');
      }

      // Add enhanced markers if enabled
      if (showMarkers) {
        const markersLayer = L.layerGroup();
        markersLayer._isCustomLayer = true;

        filteredIssues.forEach(issue => {
          const colors = {
            'resolved': { bg: '#10B981', border: '#059669' },      // Green
            'in-progress': { bg: '#F59E0B', border: '#D97706' },   // Amber/Yellow
            'pending': { bg: '#EF4444', border: '#DC2626' }        // Red
          };
          
          const color = colors[issue.status];

          // Create a custom HTML marker (more visible)
          const customIcon = L.divIcon({
            html: `
              <div style="
                width: 20px; 
                height: 20px; 
                border-radius: 50%; 
                background-color: ${color.bg}; 
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
              ">
                <div style="
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  width: 8px;
                  height: 8px;
                  background: ${color.border};
                  border-radius: 50%;
                  border: 1px solid white;
                "></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            className: 'custom-issue-marker'
          });

          const marker = L.marker([issue.latitude, issue.longitude], { 
            icon: customIcon 
          }).bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #111;">
                ${issue.title}
              </h3>
              <div style="margin: 6px 0; padding: 4px 8px; background: ${color.bg}20; border-left: 3px solid ${color.bg}; border-radius: 4px;">
                <strong>Status:</strong> 
                <span style="color: ${color.bg}; font-weight: 600; text-transform: uppercase; font-size: 11px;">
                  ${issue.status.replace('-', ' ')}
                </span>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">
                <strong>Category:</strong> ${issue.category}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">
                <strong>Priority:</strong> ${issue.priority}
              </p>
              <p style="margin: 8px 0 4px 0; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 6px;">
                Issue ID: ${issue.id}
              </p>
            </div>
          `);

          markersLayer.addLayer(marker);
        });

        markersLayer.addTo(map);
        console.log('📍 Enhanced markers added:', filteredIssues.length);
      }

    } catch (error) {
      console.error('❌ Error updating map layers:', error);
    }
  }, [filteredIssues, showMarkers]);

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-gray-600 font-medium">No location data available</p>
          <p className="text-gray-500 text-sm">Issues need latitude/longitude to display on map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden"
        style={{ zIndex: 1 }}
      />

      {/* Enhanced Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-lg z-[1000]">
        {/* Show Markers Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showMarkers"
            checked={showMarkers}
            onChange={(e) => setShowMarkers(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showMarkers" className="text-sm font-medium text-gray-700">
            Show Markers
          </label>
        </div>

        {/* Fit to Markers Button */}
        {filteredIssues.length > 0 && (
          <button
            onClick={() => {
              const map = mapInstanceRef.current;
              if (!map) return;
              
              if (filteredIssues.length === 1) {
                const issue = filteredIssues[0];
                map.setView([issue.latitude, issue.longitude], 16);
                return;
              }
              
              const group = new L.FeatureGroup();
              filteredIssues.forEach(issue => {
                const marker = L.marker([issue.latitude, issue.longitude]);
                group.addLayer(marker);
              });
              
              map.fitBounds(group.getBounds(), {
                padding: [30, 30],
                maxZoom: 14
              });
            }}
            className="w-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            🎯 Fit to Markers
          </button>
        )}

        {/* Enhanced Legend */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Status Legend</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
              <span className="text-gray-700 font-medium">🔴 Pending ({filteredIssues.filter(i => i.status === 'pending').length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
              <span className="text-gray-700 font-medium">🟡 In Progress ({filteredIssues.filter(i => i.status === 'in-progress').length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span className="text-gray-700 font-medium">🟢 Resolved ({filteredIssues.filter(i => i.status === 'resolved').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Status Counter */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl border border-gray-200 p-4 shadow-lg z-[1000]">
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-black">{filteredIssues.length}</div>
          <div className="text-xs text-gray-600 font-medium">Issues Displayed</div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-red-600 font-medium">🔴 Pending:</span>
            <span className="font-bold">{filteredIssues.filter(i => i.status === 'pending').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-600 font-medium">🟡 In Progress:</span>
            <span className="font-bold">{filteredIssues.filter(i => i.status === 'in-progress').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-600 font-medium">🟢 Resolved:</span>
            <span className="font-bold">{filteredIssues.filter(i => i.status === 'resolved').length}</span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="absolute top-4 left-4 bg-black/75 text-white rounded-lg p-2 text-xs z-[1000]">
        <div>Total: {issues.length}</div>
        <div>Filtered: {filteredIssues.length}</div>
        <div>Markers: {showMarkers ? 'ON' : 'OFF'}</div>
        <div>Auto-zoom: ✅</div>
      </div>
    </div>
  );
};
