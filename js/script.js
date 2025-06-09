document.getElementById('formUser').addEventListener('submit', async function(event) {
    event.preventDefault();

    const novouser = {
        id: Date.now(),
        name: document.getElementById('name').value,
        idade: parseInt(document.getElementById('idade').value),
        cidade: document.getElementById('cidade').value
    }

    try {
        const responsee = await fetch (`http://${window.location.hostname}/api/users`, {
            method: 'post', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novouser)
        });

        if(!responsee.ok){
            console.log('Erro na Conexao', responsee.status);
        }

        const respostaa = await responsee.json();
        console.log('User Added: ', respostaa)

        const lista = document.getElementById('alert');

        lista.innerHTML += `
            <p>O user ${novouser.name} foi adicionado</p>`
        document.getElementById('formUser').reset();
    } catch (error) {
        console.error('Erro: ', error);
    }
})

async function carregarUsers() {
    try {
        const lista = document.getElementById('lista');
        const respons = await fetch ('server/database.json');

        if (!respons.ok) {
            console.log('Erro de Conexao');
        } else {
            console.log('Conectado');
            const data = await respons.json();
            const users = data.users;

            users.forEach(user => {
                lista.innerHTML += `
                    <h3>${user.name}</h3>
                    <p>${user.idade}</p>
                    <p>${user.cidade}</p>`  
            });
        }
    } catch (error) {
        console.error('Erro:', error);
    }
    
}

