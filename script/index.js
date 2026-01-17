// 1. Configurações e chaves utilizadas no localStorage
const STORAGE_USER = 'usuarioLogado';
const STORAGE_USERS = 'users';
const STORAGE_XP = 'levelup_xp'; // mantido só para compatibilidade com dados antigos
const STORAGE_SALDO = 'levelup_saldo';
const STORAGE_NIVEL = 'levelup_nivel';
const XP_POR_NIVEL = 500;

// 2. Utilidades de leitura/escrita
function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}

function carregarUsuarioLogado() {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
}

function salvarUsuarioLogado(usuarioAtualizado) {
    // Atualiza o usuário logado
    localStorage.setItem(STORAGE_USER, JSON.stringify(usuarioAtualizado));

    // Sincroniza o mesmo registro na lista de usuários
    const usuarios = carregarUsuarios();
    const idx = usuarios.findIndex(u => u.nome?.toLowerCase() === usuarioAtualizado.nome?.toLowerCase());
    if (idx >= 0) {
        usuarios[idx] = usuarioAtualizado;
    } else {
        usuarios.push(usuarioAtualizado);
    }
    localStorage.setItem(STORAGE_USERS, JSON.stringify(usuarios));

    // Mantém as chaves antigas para não quebrar dados já salvos
    localStorage.setItem(STORAGE_XP, usuarioAtualizado.xpAtual);
    localStorage.setItem(STORAGE_SALDO, usuarioAtualizado.money);
    localStorage.setItem(STORAGE_NIVEL, usuarioAtualizado.level);
}

// 3. Estado inicial puxado SEMPRE do usuarioLogado
let usuarioLogado = carregarUsuarioLogado() || {
    nome: 'Convidado',
    senha: '',
    xpAtual: 0,
    xpNecessario: XP_POR_NIVEL,
    level: 1,
    money: 0,
    itens: []
};

let xpAtual = parseInt(usuarioLogado.xpAtual) || 0;
let saldoAtual = parseInt(usuarioLogado.money) || 0;
let nivelAtual = parseInt(usuarioLogado.level) || 1;

// 4. Função para salvar dados de forma consistente no mesmo objeto
function salvarDados() {
    usuarioLogado = {
        ...usuarioLogado,
        xpAtual,
        money: saldoAtual,
        level: nivelAtual,
        xpNecessario: XP_POR_NIVEL
    };

    salvarUsuarioLogado(usuarioLogado);
    atualizarInterface();
}

// 5. Função ÚNICA para ganhar XP e Dinheiro
function uparPersonagem(quantidadeXP, checkbox) {
    // Se não passar o checkbox (clique antigo), assume que está ganhando
    if (!checkbox || checkbox.checked) {
        xpAtual += quantidadeXP;
        saldoAtual += 100;

        // Trava o checkbox para não ganhar XP infinito
        if (checkbox) checkbox.disabled = true;
    }

    // Lógica de Level Up
    if (xpAtual >= nivelAtual * XP_POR_NIVEL) {
        nivelAtual++;
        alert(`Parabéns! Você subiu para o nível ${nivelAtual}!`);
    }

    salvarDados();
}

// 6. Função para atualizar os elementos visuais
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

// 7. Eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();

    // Se estiver na página de quests, garante que os cliques funcionem
    document.querySelectorAll('.quest-checkbox').forEach(checkbox => {
        // Se precisar de lógica extra ao carregar (ex: tarefas já feitas)
    });
});
