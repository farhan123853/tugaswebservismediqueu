const API_URL = 'http://localhost:5000/api';

// --- Utility Functions ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icon = type === 'success' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToken() {
    return localStorage.getItem('token');
}

function getUserData() {
    return JSON.parse(localStorage.getItem('user'));
}

function checkAuth(expectedRole) {
    const token = getToken();
    const user = getUserData();
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return;
    }
    
    if (expectedRole && user.role !== expectedRole) {
        window.location.href = user.role === 'pasien' ? 'dashboard.html' : 'petugas.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function getBadgeClass(status) {
    if (status === 'menunggu') return 'badge-menunggu';
    if (status === 'dipanggil') return 'badge-dipanggil';
    if (status === 'selesai') return 'badge-selesai';
    return '';
}

// --- Auth Handling ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login berhasil!');
            
            setTimeout(() => {
                if (data.user.role === 'pasien') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'petugas.html';
                }
            }, 1000);
        } else {
            showToast(data.message || 'Login gagal', 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const nama = document.getElementById('reg-nama').value;
    const email = document.getElementById('reg-email').value;
    const hp = document.getElementById('reg-hp').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, no_hp: hp, password, role: 'pasien' })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast('Registrasi berhasil! Silahkan login.');
            document.getElementById('register-form').reset();
            switchTab('login'); // back to login tab
        } else {
            showToast(data.message || 'Registrasi gagal', 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}

// --- Pasien Dashboard Functions ---
function loadPatientData() {
    const user = getUserData();
    if(document.getElementById('user-name-display')) {
        document.getElementById('user-name-display').textContent = user.nama;
    }
    loadQueueStatus();
    loadHistory();
}

async function handleTakeQueue(e) {
    e.preventDefault();
    const poli = document.getElementById('poli').value;
    const keluhan = document.getElementById('keluhan').value;
    
    try {
        const res = await fetch(`${API_URL}/queue/take`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ poli, keluhan })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast('Berhasil mengambil antrian!');
            document.getElementById('keluhan').value = '';
            document.getElementById('poli').value = '';
            loadQueueStatus();
            loadHistory();
        } else {
            showToast(data.message || 'Gagal mengambil antrian', 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}

async function loadQueueStatus() {
    try {
        const res = await fetch(`${API_URL}/queue/status`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const responseData = await res.json();
        const container = document.getElementById('active-queue-container');
        
        if (!container) return; // not in dashboard

        if (res.ok && responseData.data) {
            const data = responseData.data;
            container.innerHTML = `
                <div class="status-card">
                    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.875rem;">Nomor Antrian Anda</p>
                    <h2>${data.nomor_antrian}</h2>
                    <span class="badge ${getBadgeClass(data.status)}" style="font-size: 0.875rem; padding: 0.5rem 1rem;">${data.status}</span>
                    
                    <div class="status-details">
                        <div class="status-item">
                            <span>Poli</span>
                            <strong>${data.poli}</strong>
                        </div>
                        <div class="status-item">
                            <span>Antrian di depan</span>
                            <strong>${data.antrian_di_depan}</strong>
                        </div>
                        <div class="status-item">
                            <span>Estimasi Waktu</span>
                            <strong>${data.estimasi_waktu}</strong>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <p>Anda belum mengambil antrian hari ini.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Gagal load status:", err);
    }
}

async function loadHistory() {
    try {
        const res = await fetch(`${API_URL}/history/`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await res.json();
        const tbody = document.getElementById('history-body');
        
        if (!tbody) return;

        if (res.ok && data.data.length > 0) {
            tbody.innerHTML = '';
            data.data.forEach(h => {
                tbody.innerHTML += `
                    <tr>
                        <td>${h.tanggal}</td>
                        <td style="font-weight: 600;">${h.nomor_antrian}</td>
                        <td>${h.poli}</td>
                        <td><span class="badge ${getBadgeClass(h.status)}">${h.status}</span></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Belum ada riwayat kunjungan.</td></tr>`;
        }
    } catch (err) {
        console.error("Gagal load history:", err);
    }
}

// --- Petugas Dashboard Functions ---
async function loadAllQueues() {
    try {
        const res = await fetch(`${API_URL}/queue/all`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const responseData = await res.json();
        const tbody = document.getElementById('all-queues-body');
        
        if (!tbody) return;

        if (res.ok && responseData.data) {
            const filterPoli = document.getElementById('filter-poli').value;
            let queues = responseData.data;
            
            if (filterPoli) {
                queues = queues.filter(q => q.poli === filterPoli);
            }

            if (queues.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Tidak ada antrian hari ini.</td></tr>`;
                return;
            }

            tbody.innerHTML = '';
            queues.forEach(q => {
                let actionBtn = '-';
                if (q.status === 'dipanggil') {
                    actionBtn = `<button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="doneQueue(${q.id})">Selesaikan</button>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td>${q.id}</td>
                        <td style="font-weight: 700; color: var(--primary);">${q.nomor_antrian}</td>
                        <td>${q.nama_pasien}</td>
                        <td>${q.poli}</td>
                        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${q.keluhan}">${q.keluhan}</td>
                        <td><span class="badge ${getBadgeClass(q.status)}">${q.status}</span></td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Gagal load antrian:", err);
    }
}

async function callNextQueue() {
    const poli = document.getElementById('filter-poli').value;
    const body = poli ? JSON.stringify({ poli }) : JSON.stringify({});
    
    try {
        const res = await fetch(`${API_URL}/queue/next`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: body
        });
        
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            loadAllQueues();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}

async function doneQueue(id) {
    try {
        const res = await fetch(`${API_URL}/queue/done/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            loadAllQueues();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}
