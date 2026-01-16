personagem = {
    nome: "Ruan",
    xpAtual: 0,
    xpNecessario: 100,
    level: 0,
    itens: []
}


function uparPersonagem(quantidade) {
    personagem.xpAtual += quantidade;
    
    while (personagem.xpAtual >= personagem.xpNecessario) {
        personagem.xpAtual -= personagem.xpNecessario;
        personagem.level += 1;
        personagem.xpNecessario *= 2;
        alert("Level up!")
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