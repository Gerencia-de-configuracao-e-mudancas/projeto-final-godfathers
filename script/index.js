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
    localStorage.setItem(STORAGE_XP, xpAtual);
    localStorage.setItem(STORAGE_SALDO, saldoAtual);
    localStorage.setItem(STORAGE_NIVEL, nivelAtual);
    
    // Opcional: Se você usa o objeto 'usuarioLogado' para outras coisas
    const personagem = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    personagem.xp = xpAtual;
    personagem.saldo = saldoAtual;
    personagem.nivel = nivelAtual;
    localStorage.setItem('usuarioLogado', JSON.stringify(personagem));

    atualizarInterface();
}

// 4. Função ÚNICA para ganhar XP e Dinheiro
function uparPersonagem(quantidadeXP, checkbox) {
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

    salvarDados();
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

// 6. Eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();

    // Se estiver na página de quests, garante que os cliques funcionem
    document.querySelectorAll('.quest-checkbox').forEach(checkbox => {
        // Se precisar de lógica extra ao carregar (ex: tarefas já feitas)
    });
});
