const personagem = JSON.parse(localStorage.getItem('usuarioLogado'))


function uparPersonagem(quantidade) {
    personagem.xpAtual += quantidade
    personagem.money += 100
    while (personagem.xpAtual >= personagem.xpNecessario) {
        personagem.xpAtual -= personagem.xpNecessario;
        personagem.level += 1;
        personagem.xpNecessario *= 2
        alert("Level up!")
        console.log(`level UP!`, personagem)
  }
  console.log('XP atual:', personagem.xpAtual, 'Level:', personagem.level, 'XP necessário:', personagem.xpNecessario);
}

// Travar checkboxes apos clicar
document.querySelectorAll('.quest-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            checkbox.disabled = true
        }
    })
})


// Sincroniza XP com o localStorage e salva alterações
const xpSalvo = localStorage.getItem('xp')
if (xpSalvo !== null) {
    personagem.xpAtual = Number(xpSalvo)
}

function salvarXP() {
    localStorage.setItem('xp', String(personagem.xpAtual))
    localStorage.setItem('usuarioLogado', JSON.stringify(personagem))
}

window.addEventListener('beforeunload', salvarXP)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') salvarXP()
})
