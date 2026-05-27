/**
 * REACT Component - ឧបករណ៍ផ្នែកខាងមុខ (Frontend)
 * ============================================
 * នេះគឺ React Component ដែលរៀបរាប់ពីរបៀបប្រើប្រាស់ Node.js API
 * 
 * វាបង្ហាញលេខរបៀប POST, GET, PUT, DELETE ប្រឹងប្រែង
 */

import React, { useState, useEffect } from 'react';

// ① ក្បាលលេខ API
const API_BASE_URL = "http://localhost:5000";

const ItemManager = () => {
  // ② ទុកទិន្នន័យក្នុងលេខ State React
  const [items, setItems] = useState([]);           // បញ្ជីទាំងអស់
  const [formData, setFormData] = useState({          // ដែលបង្កើត
    name: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);     // រង់ចាំ/ទាញ ຕົ້ນ

  // ③ ពេលដែលលេខម៉ាស៊ីនក្ខើង (Component Mount) - ទទួលបាន Items ពីក្រោយ
  useEffect(() => {
    fetchAllItems();
  }, []);

  /**
   * ១. ទទួលបាន Items ទាំងអស់ - GET REQUEST
   * ============================================
   * ឧបករណ៍ React ស្វាគមន៍លេខ Node.js សូម "សូមលាប់ Items ទាំងអស់"
   */
  const fetchAllItems = async () => {
    try {
      setLoading(true);
      
      // 🔗 ស្វាគមន៍ Node.js - GET /items
      const response = await fetch(`${API_BASE_URL}/items`);
      const data = await response.json();
      
      // 💾 រក្សាទុក Items ក្នុង State React
      setItems(data.items);
      console.log("✓ ទទួលបាន Items:", data.items);
      
    } catch (error) {
      console.error("❌ មានកំហុសក្នុងការទទួលបាន Items:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ២. បង្កើត Item ថ្មី - POST REQUEST
   * ============================================
   * ឧបករណ៍ React ផ្ញើលទិន្នន័យថ្មីទៅ Node.js ដើម្បីរក្សាទុក
   */
  const handleCreateItem = async (e) => {
    e.preventDefault();

    // ២.១ ពិនិត្យ៉ា - ប្រសិនបើមានទិន្នន័យខ្វះ
    if (!formData.name || !formData.description || !formData.price) {
      alert("សូមបំពេញលេខម៉ាលម្អិត");
      return;
    }

    try {
      setLoading(true);

      // 🔗 ស្វាគមន៍ Node.js - POST /items
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)  // ផ្ញើលទិន្នន័យក្នុង JSON
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✓ បង្កើត Item បានដោយជោគជ័យ:", data.item);
        
        // 💾 ក្រឡាក់ State - ដើម្បីឧបករណ៍ React ស្គាល់ថាមានលេខម៉ាថ្មី
        setItems([...items, data.item]);
        
        // 🧹 សម្អាត Form
        setFormData({ name: '', description: '', price: '' });
      }
    } catch (error) {
      console.error("❌ មានកំហុសក្នុងការបង្កើត Item:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ៣. ក្ខើង Item - PUT REQUEST
   * ============================================
   * ឧបករណ៍ React ផ្ញើលការផ្លាស់ប្តូរទៅ Node.js
   */
  const handleUpdateItem = async (id) => {
    const newName = prompt("បង្កាលឈ្មោះថ្មី:");
    if (!newName) return;

    try {
      setLoading(true);

      // 🔗 ស្វាគមន៍ Node.js - PUT /items/:id
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✓ ក្ខើង Item បានដោយជោគជ័យ");
        // 🔄 ធ្វើឱ្យសម្អាតឯកសារ - ទទួលបាន Items ថ្មីម្តងទៀត
        fetchAllItems();
      }
    } catch (error) {
      console.error("❌ មានកំហុសក្នុងការក្ខើង Item:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ៤. លុប Item - DELETE REQUEST
   * ============================================
   * ឧបករណ៍ React សូម Node.js លុប Item មាន ID ដែលបានផ្តល់ឱ្យ
   */
  const handleDeleteItem = async (id) => {
    if (!window.confirm("ឤដ្ឍលុបលេខមាន? (ពិនិត្យបានរីករាយ)")) {
      return;
    }

    try {
      setLoading(true);

      // 🔗 ស្វាគមន៍ Node.js - DELETE /items/:id
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        console.log("✓ លុប Item បានដោយជោគជ័យ");
        // 🔄 ធ្វើឱ្យសម្អាតឯកសារ - ទទួលបាន Items ថ្មីម្តងទៀត
        fetchAllItems();
      }
    } catch (error) {
      console.error("❌ មានកំហុសក្នុងការលុប Item:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 ការបង្ហាញលេខ UI
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📦 ឧបករណ៍គ្រប់គ្រងទំនិញ (Item Manager)</h1>

      {/* ═══════════════════════════════ */}
      {/* ① ដែលបង្កើត Item */}
      {/* ═══════════════════════════════ */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2>🆕 បង្កើត Item ថ្មី</h2>
        <form onSubmit={handleCreateItem}>
          <input
            type="text"
            placeholder="ឈ្មោះ (Name)"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <textarea
            placeholder="ពិពណ៌នា (Description)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="number"
            placeholder="តម្លៃ (Price)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? "រង់ចាំ..." : "➕ បង្កើត"}
          </button>
        </form>
      </div>

      {/* ═══════════════════════════════ */}
      {/* ② បង្ហាញបញ្ជីទាំងអស់ */}
      {/* ═══════════════════════════════ */}
      <div>
        <h2>📋 បញ្ជីទាំងអស់ ({items.length})</h2>
        {loading && <p>⏳ រង់ចាំ...</p>}
        {items.length === 0 && !loading && <p>គ្មាន Item ឡើយ</p>}
        
        {items.map((item) => (
          <div 
            key={item.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            <h3>{item.name}</h3>
            <p><strong>ពិពណ៌នា:</strong> {item.description}</p>
            <p><strong>តម្លៃ:</strong> ${item.price}</p>
            <p><small>បង្កើត: {new Date(item.createdAt).toLocaleDateString('km-KH')}</small></p>
            
            <button
              onClick={() => handleUpdateItem(item.id)}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '5px 10px',
                marginRight: '10px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✏️ ក្ខើង
            </button>
            
            <button
              onClick={() => handleDeleteItem(item.id)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '5px 10px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗑️ លុប
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemManager;
