import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Edit, X } from 'lucide-react';
import type { Room } from '../types';

export const RoomsCrm: React.FC = () => {
  const { rooms, updateRoom, addRoom, deleteRoom, currentUserRole } = useApp();
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form states
  const [number, setNumber] = useState('');
  const [type, setType] = useState<Room['type']>('Standard');
  const [floor, setFloor] = useState('');
  const [price, setPrice] = useState(1500);
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState('Queen Bed');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setSelectedRoom(null);
    setIsAddMode(true);
    setNumber('');
    setType('Standard');
    setFloor('');
    setPrice(1500);
    setCapacity(2);
    setBedType('Queen Bed');
    setDescription('');
    setIsEditOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsAddMode(false);
    setNumber(room.number);
    setType(room.type);
    setFloor(room.floor);
    setPrice(room.price);
    setCapacity(room.capacity);
    setBedType(room.bedType);
    setDescription(room.description);
    setIsEditOpen(true);
  };

  const handleStatusChange = (room: Room, newStatus: Room['status']) => {
    const updated: Room = {
      ...room,
      status: newStatus
    };
    updateRoom(updated);
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoom(id);
    }
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddMode) {
      addRoom({
        number,
        type,
        floor,
        price: Number(price),
        capacity: Number(capacity),
        bedType,
        description,
        status: 'Available',
        amenities: []
      });
      setIsEditOpen(false);
    } else if (selectedRoom) {
      const updated: Room = {
        ...selectedRoom,
        number,
        type,
        floor,
        price: Number(price),
        capacity: Number(capacity),
        bedType,
        description
      };
      updateRoom(updated);
      setIsEditOpen(false);
      setSelectedRoom(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Residency Rooms Inventory
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Monitor check-in statuses, trigger housekeeping blocks, or configure lodging pricing scales.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Add Room
        </button>
      </div>

      {/* Grid of rooms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {rooms.map(room => {
          let statusColor = '#16A34A'; // Available
          let statusBg = '#DCFCE7';

          if (room.status === 'Occupied') {
            statusColor = '#2563EB';
            statusBg = '#DBEAFE';
          } else if (room.status === 'Reserved') {
            statusColor = '#D97706';
            statusBg = '#FEF3C7';
          } else if (room.status === 'Maintenance') {
            statusColor = '#475569';
            statusBg = '#F1F5F9';
          } else if (room.status === 'Blocked') {
            statusColor = '#DC2626';
            statusBg = '#FEE2E2';
          }

          return (
            <div
              key={room.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ROOM</span>
                  <h3 style={{ fontSize: '1.35rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
                    {room.number}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                    {room.type} • {room.floor}
                  </span>
                </div>
                
                {/* Status Selector dropdown */}
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(room, e.target.value as Room['status'])}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: statusBg,
                    color: statusColor,
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: '4px 0', flexGrow: 1 }}>
                {room.description}
              </p>

              {/* Price & Capacity details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', fontWeight: 600 }}>PRICE / NIGHT</span>
                  <span style={{ fontWeight: 700, color: '#C9A227' }}>₹{room.price.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', fontWeight: 600 }}>CAPACITY</span>
                  <span style={{ fontWeight: 600 }}>{room.capacity} Guests ({room.bedType})</span>
                </div>
              </div>
              {/* Admin & Manager Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '4px' }}>
                <button
                  onClick={() => handleOpenEdit(room)}
                  style={{
                    flexGrow: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit size={12} /> Edit Room
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD/EDIT ROOM MODAL DIALOG */}
      {isEditOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', maxWidth: '460px', width: '100%', position: 'relative' }}>
            <button onClick={() => { setIsEditOpen(false); setSelectedRoom(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-sans)' }}>
              {isAddMode ? 'Add New Room' : `Configure Room attributes: ${selectedRoom?.number}`}
            </h3>
            <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>ROOM NUMBER</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>FLOOR</label>
                  <input
                    type="text"
                    required
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>SUITE TYPE</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Premium">Premium</option>
                    <option value="Family Room">Family Room</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>PRICE / NIGHT (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>MAX CAPACITY</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>BED specs</label>
                  <input
                    type="text"
                    required
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
