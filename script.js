// ============================================
// INVENTORI PRO - FULLY FUNCTIONAL
// ============================================

// State Management
const state = {
  theme: localStorage.getItem('theme') || 'light',
  inventory: JSON.parse(localStorage.getItem('inventory')) || [
    { id: 1, kode: 'BRG001', nama: 'Laptop Asus', kategori: 'Elektronik', stok: 24, satuan: 'Unit', harga: 12500000, minStok: 5 },
    { id: 2, kode: 'BRG002', nama: 'Mouse Wireless', kategori: 'Aksesoris', stok: 142, satuan: 'Pcs', harga: 189000, minStok: 20 },
    { id: 3, kode: 'BRG003', nama: 'Kabel HDMI', kategori: 'Kabel', stok: 8, satuan: 'Pcs', harga: 65000, minStok: 15 },
    { id: 4, kode: 'BRG004', nama: 'Monitor 24"', kategori: 'Elektronik', stok: 12, satuan: 'Unit', harga: 2150000, minStok: 4 },
    { id: 5, kode: 'BRG005', nama: 'SSD 512GB', kategori: 'Komponen', stok: 33, satuan: 'Pcs', harga: 890000, minStok: 10 },
  ],
  activeSection: 'dashboard',
  chart: null,
  nextId: 6
};

// Save to localStorage
function saveToStorage() {
  localStorage.setItem('inventory', JSON.stringify(state.inventory));
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type]}" style="font-size: 24px;"></i>
    <div style="flex: 1;">
      <div style="font-weight: 600; margin-bottom: 4px;">${type === 'success' ? 'Sukses' : type === 'error' ? 'Error' : 'Peringatan'}</div>
      <div style="font-size: 14px; color: var(--text-secondary);">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Render Main Content
function renderContent() {
  const main = document.getElementById('mainContent');
  const today = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const sections = {
    dashboard: renderDashboard,
    stock: renderStockManagement,
    opname: renderStockOpname,
    reports: renderReports
  };
  
  const titles = {
    dashboard: 'Dashboard',
    stock: 'Manajemen Stok',
    opname: 'Stock Opname',
    reports: 'Laporan & Export'
  };
  
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${titles[state.activeSection]}</h1>
      <div class="date-badge">
        <i class="far fa-calendar-alt"></i> ${today}
      </div>
    </div>
    ${sections[state.activeSection]()}
  `;
  
  if (state.activeSection === 'dashboard') {
    setTimeout(() => initChart(), 100);
  }
  
  attachEventListeners();
}

// Dashboard
function renderDashboard() {
  const totalItems = state.inventory.length;
  const totalStock = state.inventory.reduce((sum, i) => sum + i.stok, 0);
  const totalValue = state.inventory.reduce((sum, i) => sum + (i.stok * i.harga), 0);
  const lowStock = state.inventory.filter(i => i.stok < i.minStok).length;
  
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <h3>Total Barang</h3>
          <div class="stat-value">${totalItems}</div>
        </div>
        <div class="stat-icon">
          <i class="fas fa-box"></i>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Total Stok</h3>
          <div class="stat-value">${totalStock.toLocaleString()}</div>
        </div>
        <div class="stat-icon">
          <i class="fas fa-layer-group"></i>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Nilai Inventori</h3>
          <div class="stat-value">Rp ${(totalValue/1000000).toFixed(1)}M</div>
        </div>
        <div class="stat-icon">
          <i class="fas fa-money-bill"></i>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Stok Menipis</h3>
          <div class="stat-value" style="color: var(--warning);">${lowStock}</div>
        </div>
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas id="stockChart"></canvas>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 20px;">Stok Terbaru</h3>
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${state.inventory.slice(0, 5).map(item => `
            <tr>
              <td><strong>${item.kode}</strong></td>
              <td>${item.nama}</td>
              <td>${item.kategori}</td>
              <td>${item.stok} ${item.satuan}</td>
              <td>
                <span class="badge ${item.stok > item.minStok ? 'badge-success' : 'badge-warning'}">
                  ${item.stok > item.minStok ? 'Tersedia' : 'Menipis'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Stock Management
function renderStockManagement() {
  return `
    <div class="table-container">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h3>Daftar Inventori</h3>
        <button class="btn btn-primary" onclick="addNewItem()">
          <i class="fas fa-plus"></i> Tambah Barang
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Harga</th>
            <th>Min Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="stockTableBody">
          ${state.inventory.map(item => `
            <tr data-id="${item.id}">
              <td><input class="editable-input" data-field="kode" value="${item.kode}"></td>
              <td><input class="editable-input" data-field="nama" value="${item.nama}"></td>
              <td><input class="editable-input" data-field="kategori" value="${item.kategori}"></td>
              <td><input class="editable-input" type="number" data-field="stok" value="${item.stok}"></td>
              <td><input class="editable-input" data-field="satuan" value="${item.satuan}"></td>
              <td><input class="editable-input" type="number" data-field="harga" value="${item.harga}"></td>
              <td><input class="editable-input" type="number" data-field="minStok" value="${item.minStok}"></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" onclick="saveItem(${item.id})">
                    <i class="fas fa-save"></i>
                  </button>
                  <button class="btn-icon delete" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Stock Opname
function renderStockOpname() {
  return `
    <div class="table-container">
      <h3 style="margin-bottom: 20px;">Stock Opname - Penyesuaian Fisik</h3>
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik</th>
            <th>Selisih</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${state.inventory.map(item => `
            <tr>
              <td>${item.kode}</td>
              <td>${item.nama}</td>
              <td>${item.stok} ${item.satuan}</td>
              <td>
                <input class="editable-input" type="number" id="fisik-${item.id}" value="${item.stok}">
              </td>
              <td>
                <span class="badge badge-success" id="selisih-${item.id}">0</span>
              </td>
              <td>
                <button class="btn btn-success" onclick="applyOpname(${item.id})">
                  <i class="fas fa-check"></i> Terapkan
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Reports
function renderReports() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <h3>Export Excel</h3>
          <div class="stat-value">XLSX</div>
        </div>
        <button class="btn btn-primary" onclick="exportToExcel()">
          <i class="fas fa-download"></i> Export
        </button>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Export CSV</h3>
          <div class="stat-value">CSV</div>
        </div>
        <button class="btn btn-primary" onclick="exportToCSV()">
          <i class="fas fa-download"></i> Export
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 20px;">Ringkasan Data</h3>
      <table>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Jumlah Item</th>
            <th>Total Stok</th>
            <th>Nilai</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(groupByCategory()).map(([cat, items]) => `
            <tr>
              <td>${cat}</td>
              <td>${items.length}</td>
              <td>${items.reduce((s, i) => s + i.stok, 0)}</td>
              <td>Rp ${items.reduce((s, i) => s + (i.stok * i.harga), 0).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Helper Functions
function groupByCategory() {
  return state.inventory.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {});
}

function initChart() {
  const ctx = document.getElementById('stockChart')?.getContext('2d');
  if (!ctx) return;
  
  if (state.chart) state.chart.destroy();
  
  const categories = [...new Set(state.inventory.map(i => i.kategori))];
  const data = categories.map(cat => 
    state.inventory.filter(i => i.kategori === cat).reduce((sum, i) => sum + i.stok, 0)
  );
  
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: 'Total Stok',
        data: data,
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// CRUD Operations
window.addNewItem = () => {
  const newId = state.nextId++;
  state.inventory.push({
    id: newId,
    kode: `BRG${String(newId).padStart(3, '0')}`,
    nama: 'Barang Baru',
    kategori: 'Umum',
    stok: 0,
    satuan: 'Pcs',
    harga: 0,
    minStok: 10
  });
  
  saveToStorage();
  renderContent();
  showToast('Barang baru berhasil ditambahkan', 'success');
};

window.saveItem = (id) => {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const inputs = row.querySelectorAll('.editable-input');
  const item = state.inventory.find(i => i.id === id);
  
  inputs.forEach(input => {
    const field = input.dataset.field;
    let value = input.value;
    if (['stok', 'harga', 'minStok'].includes(field)) {
      value = parseInt(value) || 0;
    }
    item[field] = value;
  });
  
  saveToStorage();
  showToast(`Data ${item.nama} berhasil disimpan`, 'success');
};

window.deleteItem = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
    state.inventory = state.inventory.filter(i => i.id !== id);
    saveToStorage();
    renderContent();
    showToast('Item berhasil dihapus', 'success');
  }
};

window.applyOpname = (id) => {
  const fisikInput = document.getElementById(`fisik-${id}`);
  const fisik = parseInt(fisikInput.value) || 0;
  const item = state.inventory.find(i => i.id === id);
  
  if (item) {
    const selisih = fisik - item.stok;
    item.stok = fisik;
    
    const selisihSpan = document.getElementById(`selisih-${id}`);
    selisihSpan.textContent = (selisih > 0 ? '+' : '') + selisih;
    selisihSpan.className = `badge ${selisih === 0 ? 'badge-success' : 'badge-warning'}`;
    
    saveToStorage();
    showToast(`Stok ${item.nama} disesuaikan (selisih: ${selisih})`, 'success');
  }
};

// Export Functions
window.exportToExcel = () => {
  const data = state.inventory.map(({ id, ...rest }) => rest);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventori");
  XLSX.writeFile(wb, `inventori_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast('File Excel berhasil diekspor', 'success');
};

window.exportToCSV = () => {
  const headers = ['kode', 'nama', 'kategori', 'stok', 'satuan', 'harga', 'minStok'];
  const csv = [
    headers.join(','),
    ...state.inventory.map(item => headers.map(h => item[h]).join(','))
  ].join('\n');
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventori_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('File CSV berhasil diekspor', 'success');
};

// Event Listeners
function attachEventListeners() {
  // Opname real-time calculation
  document.querySelectorAll('[id^="fisik-"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = parseInt(e.target.id.split('-')[1]);
      const fisik = parseInt(e.target.value) || 0;
      const item = state.inventory.find(i => i.id === id);
      if (item) {
        const selisih = fisik - item.stok;
        const selisihSpan = document.getElementById(`selisih-${id}`);
        if (selisihSpan) {
          selisihSpan.textContent = (selisih > 0 ? '+' : '') + selisih;
          selisihSpan.className = `badge ${selisih === 0 ? 'badge-success' : 'badge-warning'}`;
        }
      }
    });
  });
}

// Theme Toggle
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const icon = themeToggle.querySelector('i');
  const span = themeToggle.querySelector('span');
  
  document.body.setAttribute('data-theme', state.theme);
  icon.className = state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  span.textContent = state.theme === 'light' ? 'Dark Mode' : 'Light Mode';
  
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    document.body.setAttribute('data-theme', state.theme);
    icon.className = state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    span.textContent = state.theme === 'light' ? 'Dark Mode' : 'Light Mode';
    
    // Re-render chart if on dashboard
    if (state.activeSection === 'dashboard') {
      setTimeout(() => initChart(), 100);
    }
  });
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (section) {
        state.activeSection = section;
        
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        renderContent();
      }
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  renderContent();
});
// Tambahkan di bagian atas script.js, setelah state declaration

// Mobile Sidebar Management
function initMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);
  
  // Create mobile header with hamburger
  const mainContent = document.getElementById('mainContent');
  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'mobile-header';
  mobileHeader.innerHTML = `
    <button class="hamburger" id="mobileMenuBtn">
      <i class="fas fa-bars"></i>
    </button>
    <div style="flex: 1;"></div>
  `;
  
  // Insert mobile header before content
  const insertMobileHeader = () => {
    const existingHeader = document.querySelector('.mobile-header');
    if (!existingHeader && window.innerWidth <= 768) {
      const pageHeader = document.querySelector('.page-header');
      if (pageHeader) {
        pageHeader.parentNode.insertBefore(mobileHeader, pageHeader);
      }
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
  };
  
  // Event listeners
  document.addEventListener('click', (e) => {
    if (e.target.closest('#mobileMenuBtn')) {
      toggleSidebar();
    }
  });
  
  overlay.addEventListener('click', toggleSidebar);
  
  // Close sidebar on window resize if mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      const mobileHeaderEl = document.querySelector('.mobile-header');
      if (mobileHeaderEl) mobileHeaderEl.remove();
    } else {
      insertMobileHeader();
    }
  });
  
  // Initial check
  if (window.innerWidth <= 768) {
    insertMobileHeader();
  }
  
  // Close sidebar when clicking nav items on mobile
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    });
  });
}

// Update renderContent untuk mobile
const originalRenderContent = renderContent;
renderContent = function() {
  originalRenderContent();
  
  // Re-insert mobile header if needed
  if (window.innerWidth <= 768) {
    const existingMobileHeader = document.querySelector('.mobile-header');
    if (!existingMobileHeader) {
      const mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-header';
      mobileHeader.innerHTML = `
        <button class="hamburger" id="mobileMenuBtn">
          <i class="fas fa-bars"></i>
        </button>
        <div style="flex: 1;"></div>
      `;
      
      const mainContent = document.getElementById('mainContent');
      const pageHeader = mainContent.querySelector('.page-header');
      if (pageHeader) {
        mainContent.insertBefore(mobileHeader, pageHeader);
      }
    }
  }
  
  attachEventListeners();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initMobileSidebar();
  renderContent();
});

// Add collapse functionality for desktop
function initDesktopCollapse() {
  const sidebar = document.getElementById('sidebar');
  const logo = document.querySelector('.logo');
  
  // Double click logo to collapse
  logo?.addEventListener('dblclick', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
  });
  
  // Restore collapse state
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState === 'true' && window.innerWidth > 768) {
    sidebar.classList.add('collapsed');
  }
}

// Call desktop collapse
initDesktopCollapse();
