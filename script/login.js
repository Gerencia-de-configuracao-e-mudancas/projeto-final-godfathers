const tabButtons = document.querySelectorAll('.tab-btn')

// Função para validar email com regex rigoroso
function validarEmail(email) {
    // Regex: user@domain.extension
    // ^[^\s@]+ : começa com 1+ caracteres (não espaço ou @)
    // @ : símbolo @
    // [^\s@]+ : 1+ caracteres (não espaço ou @)
    // \. : ponto obrigatório
    // [^\s@]+ : 1+ caracteres para extensão (não espaço ou @)
    // $ : fim da string
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function loadUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]')
}

function switchTab(tabName) {
    // Remove active de todos
    document.querySelectorAll('.tab-btn').forEach(btn => 
        btn.classList.remove('active')
    );
    document.querySelectorAll('.tab-content').forEach(content => 
        content.classList.remove('active')
    );
    
    // Adiciona active nos elementos específicos
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function loadPersonagem(nome, senha){
    return {
    nome,
    senha,
    xpAtual: 0,
    xpNecessario: 100,
    level: 0,
    money: 0,
    itens: [],
    questsCompletas: [] // <-- novo campo para persistir quests concluídas
}
}

function register() {
    const form = document.getElementById('register-form')
    const username = document.getElementById('register-username').value.trim()
    const email = document.getElementById('register-email').value.trim()
    const password = document.getElementById('register-password').value
    const confirmPassword = document.getElementById('register-confirm').value

    if (!username) {
        alert('Informe um nome de usuário.')
        return
    }

    // Validação rigorosa de email
    if (!email || !validarEmail(email)) {
        alert('Por favor, insira um email válido (exemplo: usuario@dominio.com)')
        return
    }

    if(password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    const users = loadUsers()
    console.log(users)
    const exists = users.some(u => u.nome.toLowerCase() === username.toLowerCase())
    if (exists) {
        alert('Usuário já existe!')
        return
    }

    let personagem = loadPersonagem(username.trim(), password)
    personagem.email = email
    users.push(personagem)
    localStorage.setItem('users', JSON.stringify(users))

    alert('Conta criada com sucesso!')
    form.reset()
    switchTab('login')
}

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault()
    register()
})

function login(){
    const username = document.getElementById('login-username').value.trim()
    const password = document.getElementById('login-password').value

    if(!username || !password) {
        alert('Preencha todos os campos!')
        return
    }

    const users = loadUsers()
    const userLogin = users.find(u => u.nome.toLowerCase() === username.toLowerCase())

    if(!userLogin){
        alert('Usuário não encontrado!')
        return
    }

    if(userLogin.senha !== password) {
        alert('Senha incorreta!')
        return
    }

    localStorage.setItem('usuarioLogado', JSON.stringify(userLogin))
    window.location.href = 'index.html' 
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault()
    login()
})