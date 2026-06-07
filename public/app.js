// NOVA GMAIL Frontend Application
const API_BASE = '/api';
let currentUser = null;
let token = localStorage.getItem('token');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  setupEventListeners();
  loadTheme();
  loadLanguage();
});

// Setup Event Listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  
  // Language select
  document.getElementById('languageSelect')?.addEventListener('change', (e) => {
    localStorage.setItem('language', e.target.value);
    location.reload();
  });

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // Withdrawal form
  document.getElementById('withdrawalForm')?.addEventListener('submit', submitWithdrawal);
}

// Load user profile
async function loadUserProfile() {
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/user/info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load profile');
    
    const data = await response.json();
    currentUser = data.user;
    
    // Update UI
    document.getElementById('mainBalance').textContent = `$${currentUser.mainBalance}`;
    document.getElementById('escrowBalance').textContent = `$${currentUser.escrowBalance}`;
    document.getElementById('completedTasks').textContent = currentUser.completedTasksCount;
    document.getElementById('referralCount').textContent = currentUser.referralCount;

    loadGmailTasks();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load Gmail tasks
async function loadGmailTasks() {
  try {
    const response = await fetch(`${API_BASE}/tasks/gmail/available`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const container = document.getElementById('gmailTasksContainer');
    
    if (data.tasks.length === 0) {
      container.innerHTML = '<p class="text-gray-300">لا توجد مهام متاحة حالياً</p>';
      return;
    }

    container.innerHTML = data.tasks.map(task => `
      <div class="bg-gray-700 p-4 rounded-lg mb-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-white font-bold">الاسم: ${task.firstName} ${task.lastName}</h4>
            <p class="text-gray-300">البريد: ${task.targetEmail}</p>
          </div>
          <span class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">$${task.reward}</span>
        </div>
        <button onclick="reserveTask('${task._id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
          احج�� هذه المهمة
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Reserve task
async function reserveTask(taskId) {
  try {
    const response = await fetch(`${API_BASE}/tasks/gmail/reserve/${taskId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to reserve task');
    
    alert('✅ تم حجز المهمة بنجاح! لديك ساعة واحدة لإكمال المهمة');
    loadUserProfile();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

// Toggle theme
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(newTheme + '-mode');
}

// Load theme
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.add(theme + '-mode');
}

// Load language
function loadLanguage() {
  const lang = localStorage.getItem('language') || 'ar';
  document.documentElement.lang = lang;
  document.getElementById('languageSelect').value = lang;
}

// Switch tab
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(tabName + '-tab')?.classList.remove('hidden');
  
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('bg-purple-600');
    el.classList.add('bg-gray-700');
  });
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.remove('bg-gray-700');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('bg-purple-600');
}

// Submit withdrawal
async function submitWithdrawal(e) {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  const method = document.getElementById('withdrawMethod').value;
  
  if (amount < 0.45) {
    alert('❌ الحد الأدنى للسحب هو $0.45');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/withdrawals/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, method })
    });

    if (!response.ok) throw new Error('Failed to submit withdrawal');
    
    alert('✅ تم إرسال طلب السحب بنجاح!');
    document.getElementById('withdrawalForm').reset();
    loadUserProfile();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}
