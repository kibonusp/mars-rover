const iniciarButton = document.getElementById('iniciar-button');

if (iniciarButton) {
    iniciarButton.addEventListener('click', () => {
        const comp = document.getElementById('comprimento');
        const larg = document.getElementById('largura');
    
        window.location.href = `/controle?comprimento=${comp.value}&largura=${larg.value}`;
    });
}