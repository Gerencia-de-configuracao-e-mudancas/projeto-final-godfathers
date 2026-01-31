// 1. Configurações e Chaves
const STORAGE_XP = 'levelup_xp';
const STORAGE_SALDO = 'levelup_saldo';
const STORAGE_NIVEL = 'levelup_nivel';
const XP_POR_NIVEL = 500;

// 2. Inicialização de dados (Lê do localStorage ou começa do zero)
let xpAtual = parseInt(localStorage.getItem(STORAGE_XP)) || 0;
let saldoAtual = parseInt(localStorage.getItem(STORAGE_SALDO)) || 0;
let nivelAtual = parseInt(localStorage.getItem(STORAGE_NIVEL)) || 1;

// 3. Função para salvar dados de forma consistente
function salvarDados() {
    const u = getUsuarioLogado();
    if (!u) return;

    // Sincroniza campos conhecidos, se existirem no escopo atual
    if (typeof xpAtual !== 'undefined') u.xpAtual = xpAtual;
    if (typeof nivelAtual !== 'undefined') u.level = nivelAtual;
    if (typeof saldoAtual !== 'undefined') u.money = saldoAtual;

    // u.questsCompletas já é atualizada por marcarQuestConcluida(...)
    setUsuarioLogado(u);

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

    // Se não passar o checkbox (clique antigo), assume que está ganhando
    if (checkbox && checkbox.checked) {
        xpAtual += quantidadeXP;
        saldoAtual += 100;

        // Lógica de Level Up
        if (xpAtual >= nivelAtual * XP_POR_NIVEL) {
            nivelAtual++;
            alert(`Parabéns! Você subiu para o nível ${nivelAtual}!`);
        }
    }

    // Marca como concluída e persiste
    marcarQuestConcluida(String(questId));
    salvarDados();

    // bloqueia refarm visualmente
    checkbox.checked = true;
    checkbox.disabled = true;
    questItem && questItem.classList.add('completed');
}

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

        // Disponibiliza uma função global para comprar itens: debita do saldo e/ou XP e armazena o item
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

// 6. Eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();

    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Se estiver na página de quests, garante que os cliques funcionem
    document.querySelectorAll('.quest-checkbox').forEach(checkbox => {
        // Se precisar de lógica extra ao carregar (ex: tarefas já feitas)
    });

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
