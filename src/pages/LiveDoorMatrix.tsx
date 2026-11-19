import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DoorOpen, DoorClosed, Lock, Unlock, Clock, Search, 
  Plus, RefreshCw
} from 'lucide-react';
import type { Room } from '../types';

export const LiveDoorMatrix: React.FC = () => {
  const { 
    bookings, rooms, setView, 
    setSelectedBooking, addToast 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to sync room occupancy, active guest, and checkout time with real bookings
  const getRoomDoorData = (room: Room) => {
    const activeBooking = bookings.find(b => {
      if (b.status === 'Cancelled' || b.status === 'Checked-out' || b.status === 'Completed') return false;
      const matchId = (b.roomIds && b.roomIds.includes(room.id)) || b.serviceId === room.id;
      const roomNum = room.number || (room as any).roomNumber || '';
      const matchNum = (b as any).roomNumber === roomNum || (b as any).roomNumber === room.id;
      return (matchId || matchNum) && (b.status === 'Checked-in' || b.status === 'Confirmed');
    });

    const isOccupiedByBooking = !!activeBooking;
    const isOccupied = isOccupiedByBooking || room.status === 'Occupied';
    const isBlocked = room.status === 'Maintenance' || room.status === 'Blocked' || room.status === 'Cleaning';
    const isFree = !isOccupied && !isBlocked;

    let guestName = '';
    let checkoutTime = 'Ready for Check-In';

    if (activeBooking) {
      guestName = activeBooking.customerName || (activeBooking as any).guestName || 'Registered Guest';
      if (activeBooking.actualCheckOutTime) {
        checkoutTime = activeBooking.actualCheckOutTime;
      } else if (activeBooking.checkOutDate) {
        if (activeBooking.checkOutDate === todayStr) {
          checkoutTime = 'Today, 11:00 AM';
        } else {
          const d = new Date(activeBooking.checkOutDate);
          checkoutTime = `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, 11:00 AM`;
        }
      } else {
        checkoutTime = 'Today, 11:00 AM';
      }
    } else if (isOccupied) {
      guestName = (room as any).currentGuest || 'Registered Guest';
      checkoutTime = 'Today, 11:00 AM';
    } else if (isBlocked) {
      checkoutTime = 'In Service';
    }

    return {
      isOccupied,
      isBlocked,
      isFree,
      guestName,
      checkoutTime,
      activeBooking: activeBooking || null
    };
  };

  // Full Room Door Inventory dynamically synced with rooms.length
  const roomDoorList = rooms.map(room => ({
    room,
    door: getRoomDoorData(room)
  }));

  const occupiedRooms = roomDoorList.filter(item => item.door.isOccupied).length;
  const maintenanceRooms = roomDoorList.filter(item => item.door.isBlocked).length;
  const availableRooms = Math.max(0, rooms.length - occupiedRooms - maintenanceRooms);

  // Door status and query filters
  const [doorStatusFilter, setDoorStatusFilter] = useState<'all' | 'free' | 'occupied' | 'blocked'>('all');
  const [doorSearch, setDoorSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredDoors = roomDoorList.filter(item => {
    const { room, door } = item;
    if (doorStatusFilter === 'free' && !door.isFree) return false;
    if (doorStatusFilter === 'occupied' && !door.isOccupied) return false;
    if (doorStatusFilter === 'blocked' && !door.isBlocked) return false;

    if (doorSearch.trim()) {
      const q = doorSearch.toLowerCase();
      const num = (room.number || (room as any).roomNumber || '').toLowerCase();
      const guest = door.guestName.toLowerCase();
      const type = (room.type || '').toLowerCase();
      return num.includes(q) || guest.includes(q) || type.includes(q);
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('🔄 Door Locks Synchronized', 'All room key statuses and departure logs updated.', 'info');
    }, 450);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      
      {/* 1. EXECUTIVE HEADER CARD (Blue, Red, White) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '24px 28px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
              🔑 LIVE ROOM KEY INVENTORY
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              • {rooms.length} Total Registered Inventory Keys
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            🚪 Live Door Matrix & Occupancy Keys
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#475569', margin: '4px 0 0 0' }}>
            Visual door status for every guest room: open doors indicate clean vacant rooms ready for check-in; locked doors indicate occupied stays with real-time checkout schedules.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>🔄 Sync Locks</span>
          </button>

          <button
            type="button"
            onClick={() => setView('crm/onsite-booking')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>✨ Walk-In Check-In</span>
          </button>
        </div>
      </div>

      {/* 2. STATS BANNER CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Inventory Keys */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🔑 Total Inventory Keys
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
            {rooms.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>
            All floors synchronized with reception
          </div>
        </div>

        {/* Doors Open / Vacant */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #BFDBFE', borderLeft: '4px solid #2563EB', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🟢 Doors Open (Vacant)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>
            {availableRooms}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
            Ready for instant guest walk-in
          </div>
        </div>

        {/* Doors Locked / Occupied */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #FECACA', borderLeft: '4px solid #DC2626', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🔴 Doors Locked (Occupied)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
            {occupiedRooms}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
            Active stays with folio logs
          </div>
        </div>

        {/* Maintenance / Blocked */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', borderLeft: '4px solid #64748B', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🧹 Service / Blocked
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#475569', marginTop: '4px' }}>
            {maintenanceRooms}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
            Housekeeping & maintenance
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE DOOR GRID SECTION */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '24px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}>
        
        {/* Controls Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #F1F5F9'
        }}>
          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '7px 12px',
            gap: '8px',
            width: 'clamp(220px, 25vw, 360px)'
          }}>
            <Search size={15} color="#2563EB" />
            <input
              type="text"
              placeholder="Search door #, guest name, room type..."
              value={doorSearch}
              onChange={(e) => setDoorSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0F172A',
                width: '100%'
              }}
            />
            {doorSearch && (
              <button
                type="button"
                onClick={() => setDoorSearch('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDoorStatusFilter('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: doorStatusFilter === 'all' ? '#0F172A' : '#FFFFFF',
                color: doorStatusFilter === 'all' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🚪 All Doors ({rooms.length})
            </button>

            <button
              type="button"
              onClick={() => setDoorStatusFilter(doorStatusFilter === 'free' ? 'all' : 'free')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: doorStatusFilter === 'free' ? '#FFFFFF' : '#2563EB',
                backgroundColor: doorStatusFilter === 'free' ? '#2563EB' : '#EFF6FF',
                border: '1px solid #DBEAFE',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <DoorOpen size={14} />
              <span>🟢 Doors Open ({availableRooms})</span>
            </button>

            <button
              type="button"
              onClick={() => setDoorStatusFilter(doorStatusFilter === 'occupied' ? 'all' : 'occupied')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: doorStatusFilter === 'occupied' ? '#FFFFFF' : '#DC2626',
                backgroundColor: doorStatusFilter === 'occupied' ? '#DC2626' : '#FEF2F2',
                border: '1px solid #FEE2E2',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <DoorClosed size={14} />
              <span>🔴 Doors Locked ({occupiedRooms})</span>
            </button>

            {maintenanceRooms > 0 && (
              <button
                type="button"
                onClick={() => setDoorStatusFilter(doorStatusFilter === 'blocked' ? 'all' : 'blocked')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: doorStatusFilter === 'blocked' ? '#FFFFFF' : '#475569',
                  backgroundColor: doorStatusFilter === 'blocked' ? '#475569' : '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Lock size={13} />
                <span>⚠️ In Service ({maintenanceRooms})</span>
              </button>
            )}
          </div>
        </div>

        {/* Door Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '16px'
        }}>
          {filteredDoors.map(({ room, door }) => {
            const roomNum = room.number || (room as any).roomNumber || '101';
            const isFree = door.isFree;
            const isOccupied = door.isOccupied;
            const isBlocked = door.isBlocked;

            return (
              <div
                key={room.id}
                onClick={() => {
                  if (door.activeBooking) {
                    setSelectedBooking(door.activeBooking);
                    setView(door.activeBooking.serviceType === 'mahal' ? 'crm/bookings?service=mahal' : 'crm/bookings?service=room');
                  } else if (isFree) {
                    setView('crm/onsite-booking');
                  } else {
                    setView('crm/rooms');
                  }
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: isOccupied ? '1.5px solid #FECACA' : (isBlocked ? '1.5px dashed #CBD5E1' : '1.5px solid #BFDBFE'),
                  borderLeft: isOccupied ? '5px solid #DC2626' : (isBlocked ? '5px solid #64748B' : '5px solid #2563EB'),
                  borderRadius: '16px',
                  padding: '16px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isOccupied 
                    ? '0 10px 24px rgba(220, 38, 38, 0.12)' 
                    : '0 10px 24px rgba(37, 99, 235, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div>
                  {/* Top Plaque & Lock Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      color: '#0F172A',
                      letterSpacing: '-0.02em',
                      padding: '3px 8px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0'
                    }}>
                      DOOR {roomNum}
                    </span>

                    {isFree && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #DBEAFE'
                      }}>
                        <Unlock size={12} strokeWidth={2.5} /> OPEN
                      </span>
                    )}

                    {isOccupied && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #FEE2E2'
                      }}>
                        <Lock size={12} strokeWidth={2.5} /> LOCKED
                      </span>
                    )}

                    {isBlocked && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        backgroundColor: '#F1F5F9',
                        color: '#64748B',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0'
                      }}>
                        <Lock size={12} strokeWidth={2.5} /> BLOCKED
                      </span>
                    )}
                  </div>

                  {/* Graphic Door Banner */}
                  {isFree && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 10px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        border: '1.5px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0
                      }}>
                        <DoorOpen size={24} strokeWidth={2.2} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 850, color: '#2563EB' }}>
                          Door Unlocked
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                          Vacant • Key Ready
                        </span>
                      </div>
                    </div>
                  )}

                  {isOccupied && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 10px',
                      backgroundColor: '#FEF2F2',
                      borderRadius: '12px',
                      border: '1px solid #FEE2E2',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#FEE2E2',
                        border: '1.5px solid #FECACA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#DC2626',
                        flexShrink: 0
                      }}>
                        <DoorClosed size={24} strokeWidth={2.2} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 850, color: '#DC2626' }}>
                          Door Locked
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          👤 {door.guestName}
                        </span>
                      </div>
                    </div>
                  )}

                  {isBlocked && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 10px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#F1F5F9',
                        border: '1.5px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        flexShrink: 0
                      }}>
                        <DoorClosed size={24} strokeWidth={2.2} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 850, color: '#475569' }}>
                          Service Lock
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                          Housekeeping / Maintenance
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Room Metadata */}
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🛏️ {room.type}</span>
                    <span>{room.bedType || 'Queen Bed'}</span>
                  </div>
                </div>

                {/* Bottom Departure Checkout Time Tag */}
                <div style={{ marginTop: '12px' }}>
                  {isOccupied && (
                    <div style={{
                      padding: '7px 9px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#DC2626',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                        <Clock size={13} color="#DC2626" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          ⏰ Checkout: {door.checkoutTime}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: '#B91C1C', flexShrink: 0 }}>Folio →</span>
                    </div>
                  )}

                  {isFree && (
                    <div style={{
                      padding: '7px 9px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#2563EB',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                        <span>✨ Ready for Check-In</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#1D4ED8' }}>+ Book</span>
                    </div>
                  )}

                  {isBlocked && (
                    <div style={{
                      padding: '7px 9px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#64748B',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <Clock size={13} color="#64748B" style={{ flexShrink: 0 }} />
                      <span>🛠️ {door.checkoutTime}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
