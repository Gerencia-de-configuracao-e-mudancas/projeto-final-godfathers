// 1. Configurações e Chaves
const STORAGE_XP = 'levelup_xp';
const STORAGE_SALDO = 'levelup_saldo';
const STORAGE_NIVEL = 'levelup_nivel';
const STORAGE_QUESTS_CRIADAS = 'levelup_quests_criadas';
const XP_POR_NIVEL = 500;

// Tarefas padrão
const QUESTS_PADRAO = [];

// 2. Inicialização de dados (Lê do localStorage ou começa do zero)
let xpAtual = parseInt(localStorage.getItem(STORAGE_XP)) || 0;
let saldoAtual = parseInt(localStorage.getItem(STORAGE_SALDO)) || 0;
let nivelAtual = parseInt(localStorage.getItem(STORAGE_NIVEL)) || 1;

// 3. Função para salvar dados de forma consistente
function salvarDados() {
    // Salva diretamente no localStorage
    localStorage.setItem(STORAGE_XP, String(xpAtual));
    localStorage.setItem(STORAGE_SALDO, String(saldoAtual));
    localStorage.setItem(STORAGE_NIVEL, String(nivelAtual));

    // Também atualiza o usuário logado se existir
    const u = getUsuarioLogado();
    if (u) {
        if (typeof xpAtual !== 'undefined') u.xpAtual = xpAtual;
        if (typeof nivelAtual !== 'undefined') u.level = nivelAtual;
        if (typeof saldoAtual !== 'undefined') u.money = saldoAtual;
        setUsuarioLogado(u);
    }

    atualizarInterface();
}

// 4. Função ÚNICA para ganhar XP e Dinheiro
function uparPersonagem(quantidadeXP, checkbox) {
    const questItem = checkbox?.closest('.quest-item');
    const questId = questItem?.dataset.questId || checkbox?.id?.replace('quest-', '');

    // Se já concluída, garante marcado e desabilitado e sai
    if (getQuestsCompletas().includes(String(questId))) {
        checkbox.checked = true;
        checkbox.disabled = true;
        questItem && questItem.classList.add('completed');
        return;
    }

    // Adiciona XP e dinheiro (saldo = XP)
    xpAtual += quantidadeXP;
    saldoAtual += quantidadeXP;

    // Lógica de Level Up
    if (xpAtual >= nivelAtual * XP_POR_NIVEL) {
        nivelAtual++;
        alert(`Parabéns! Você subiu para o nível ${nivelAtual}!`);
    }

    // Marca como concluída e persiste
    marcarQuestConcluida(String(questId));
    salvarDados();

    // bloqueia refarm visualmente
    checkbox.checked = true;
    checkbox.disabled = true;
    questItem && questItem.classList.add('completed');
}

// 4.5. Função para comprar itens: debita do saldo e/ou XP e armazena o item
window.comprarItem = function (itemId, precoSaldo = 0, precoXP = 0, metadata = {}) {
    precoSaldo = Number(precoSaldo) || 0;
    precoXP = Number(precoXP) || 0;

    if (saldoAtual < precoSaldo || xpAtual < precoXP) {
        alert('Saldo ou XP insuficiente.');
        return false;
    }

    // Debita custos
    saldoAtual -= precoSaldo;
    xpAtual -= precoXP;

    // Armazena/incrementa o item comprado
    const STORAGE_ITENS = 'levelup_itens';
    const itens = JSON.parse(localStorage.getItem(STORAGE_ITENS)) || [];

    const idStr = String(itemId);
    const idx = itens.findIndex(i => i.id === idStr);
    if (idx >= 0) {
        itens[idx].qtd = (itens[idx].qtd || 1) + 1;
    } else {
        itens.push({
            id: idStr,
            qtd: 1,
            compradoEm: new Date().toISOString(),
            precoSaldo,
            precoXP,
            ...metadata
        });
    }
    localStorage.setItem(STORAGE_ITENS, JSON.stringify(itens));

    // Reflete no objeto usuarioLogado (se usado)
    const personagem = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    personagem.itens = itens;
    localStorage.setItem('usuarioLogado', JSON.stringify(personagem));

    // Persiste e atualiza UI
    salvarDados();
    return true;
};

// 5. Função para atualizar os elementos visuais
function atualizarInterface() {
    const saldoDisplay = document.getElementById('saldo-display');
    const nivelDisplay = document.getElementById('nivel-display');
    const xpFill = document.getElementById('xp-fill');
    const xpText = document.getElementById('xp-text');

    if (saldoDisplay) saldoDisplay.textContent = saldoAtual;
    if (nivelDisplay) nivelDisplay.textContent = nivelAtual;
    
    if (xpFill && xpText) {
        // Calcula o XP relativo ao nível atual para a barra não ficar sempre cheia
        const xpNoNivelAtual = xpAtual % XP_POR_NIVEL;
        const porcentagem = (xpNoNivelAtual / XP_POR_NIVEL) * 100;
        
        xpFill.style.width = porcentagem + '%';
        xpText.textContent = `XP: ${xpAtual} / ${nivelAtual * XP_POR_NIVEL}`;
    }
}

// ===== Persistência do usuário e quests concluídas =====
function getUsuarioLogado() {
  try { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
  catch { return null; }
}

function setUsuarioLogado(user) {
  localStorage.setItem('usuarioLogado', JSON.stringify(user));
  // também atualiza no array de usuários
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex(u => u.nome === user.nome);
  if (idx !== -1) {
    users[idx] = user;
    localStorage.setItem('users', JSON.stringify(users));
  }
}

function getQuestsCompletas() {
  const u = getUsuarioLogado();
  return u && Array.isArray(u.questsCompletas) ? u.questsCompletas : [];
}

function marcarQuestConcluida(questId) {
  const u = getUsuarioLogado();
  if (!u) return;
  if (!Array.isArray(u.questsCompletas)) u.questsCompletas = [];
  if (!u.questsCompletas.includes(questId)) {
    u.questsCompletas.push(String(questId));
    setUsuarioLogado(u);
  }
}

// ===== Funções para gerenciar quests criadas =====
function getQuestsCriadas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_QUESTS_CRIADAS)) || [];
  } catch {
    return [];
  }
}

function salvarQuestsCriadas(quests) {
  localStorage.setItem(STORAGE_QUESTS_CRIADAS, JSON.stringify(quests));
}

function adicionarQuestCriada(nome, xp, descricao = '') {
  const quests = getQuestsCriadas();
  const novoId = Math.max(...QUESTS_PADRAO.map(q => q.id), ...quests.map(q => q.id || 0)) + 1;
  
  quests.push({
    id: novoId,
    nome,
    descricao,
    xp,
    criada: true,
    criadaEm: new Date().toISOString()
  });
  
  salvarQuestsCriadas(quests);
  renderizarQuests();
}

function deletarQuestCriada(questId) {
  let quests = getQuestsCriadas();
  quests = quests.filter(q => q.id !== questId);
  salvarQuestsCriadas(quests);
  renderizarQuests();
}

function obterTodasAsQuests() {
  return [...QUESTS_PADRAO, ...getQuestsCriadas()];
}

function renderizarQuests() {
  const questsList = document.getElementById('quests-list');
  if (!questsList) return;

  const todasAsQuests = obterTodasAsQuests();
  questsList.innerHTML = '';

  todasAsQuests.forEach(quest => {
    const li = document.createElement('li');
    li.className = 'quest-item';
    li.dataset.questId = quest.id;

    const isConcluida = getQuestsCompletas().includes(String(quest.id));
    if (isConcluida) {
      li.classList.add('completed');
    }

    li.innerHTML = `
      <div class="quest-checkbox-wrapper">
        <input type="checkbox" class="quest-checkbox" id="quest-${quest.id}" ${isConcluida ? 'checked disabled' : ''}>
      </div>
      <div class="quest-content">
        <label for="quest-${quest.id}" class="quest-title">${quest.nome}</label>
        <p class="quest-description">${quest.descricao || ''}</p>
      </div>
      <div class="quest-xp">
        <span>+${quest.xp} XP</span>
      </div>
      ${quest.criada ? `<button class="btn-deletar-quest" data-quest-id="${quest.id}" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 1.2rem;">🗑️</button>` : ''}
    `;

    questsList.appendChild(li);

    // Adiciona event listener ao checkbox
    const checkbox = li.querySelector('.quest-checkbox');
    checkbox.addEventListener('change', function(e) {
      const questId = li.dataset.questId;
      
      // Se a tarefa já foi concluída, bloqueia desmarcação
      if (getQuestsCompletas().includes(String(questId))) {
        this.checked = true;
        this.disabled = true;
        return;
      }
      
      if (this.checked) {
        uparPersonagem(quest.xp, this);
      } else {
        this.checked = true;
      }
    });

    // Adiciona event listener ao botão deletar
    const btnDeletar = li.querySelector('.btn-deletar-quest');
    if (btnDeletar) {
      btnDeletar.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja deletar esta quest?')) {
          deletarQuestCriada(quest.id);
        }
      });
    }
  });

  // Re-adiciona event listeners aos checkboxes já concluídas
  const concluidas = getQuestsCompletas();
  document.querySelectorAll('.quest-item').forEach(item => {
    const id = String(item.dataset.questId);
    if (concluidas.includes(id)) {
      const cb = item.querySelector('.quest-checkbox');
      if (cb) {
        cb.checked = true;
        cb.disabled = true;
      }
      item.classList.add('completed');
    }
  });
}

// 6. Eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Sincroniza dados do localStorage ao carregar a página
    xpAtual = parseInt(localStorage.getItem(STORAGE_XP)) || 0;
    saldoAtual = parseInt(localStorage.getItem(STORAGE_SALDO)) || 0;
    nivelAtual = parseInt(localStorage.getItem(STORAGE_NIVEL)) || 1;
    
    atualizarInterface();

    // Renderiza as quests
    renderizarQuests();

    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // ===== MODAL DE ADICIONAR QUEST =====
    const modal = document.getElementById('modal-quest');
    const btnAdicionar = document.getElementById('btn-adicionar-quest');
    const formQuest = document.getElementById('form-quest');
    const modalClose = document.getElementById('modal-close');
    const btnCancelar = document.getElementById('btn-cancelar');

    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    if (formQuest) {
        formQuest.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('quest-nome').value.trim();
            const xp = parseInt(document.getElementById('quest-xp').value);
            const descricao = document.getElementById('quest-descricao').value.trim();

            if (nome && xp) {
                adicionarQuestCriada(nome, xp, descricao);
                formQuest.reset();
                modal.style.display = 'none';
                alert('Quest criada com sucesso! 🎉');
            }
        });
    }

    const concluidas = getQuestsCompletas();
    document.querySelectorAll('.quest-item').forEach(item => {
        const id = String(item.dataset.questId);
        if (concluidas.includes(id)) {
            const cb = item.querySelector('.quest-checkbox');
            if (cb) {
                cb.checked = true;
                cb.disabled = true;
            }
            item.classList.add('completed');
        }
    });
});
