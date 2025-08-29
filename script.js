// script.js
function rolarDado(qtd, faces) {
    let total = 0;
    for (let i = 0; i < qtd; i++) {
        total += Math.floor(Math.random() * faces) + 1;
    }
    return total;
}


// Md → multiplicador de Dano
// Mh → multiplicador de Defesa e HP
// Mt → multiplicador de Duração
const multiplicadores = {
    "Projétil":   { Md: 1.25, Mh: 1.0,  Mt: 0.75 },
    "Padrão":     { Md: 1.5,  Mh: 1.25, Mt: 1.0 },
    "Pesado":     { Md: 1.75, Mh: 1.5,  Mt: 1.0 },
    "Área":       { Md: 2.0,  Mh: 1.5,  Mt: 1.0 },
    "Colossal":   { Md: 1.25, Mh: 2.0,  Mt: 0.75 },
    "Estrutura":  { Md: 1.0,  Mh: 2.0,  Mt: 1.75 }
};

document.getElementById('forgeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const estilo = document.getElementById('estilo').value;
    const alma = parseInt(document.getElementById('alma').value) || 0;
    const blocosDano = parseInt(document.getElementById('dano').value) || 0;
    const blocosDefesa = parseInt(document.getElementById('defesa').value) || 0;
    const blocosVitalidade = parseInt(document.getElementById('vitalidade').value) || 0;
    const blocosDuracao = parseInt(document.getElementById('duracao').value) || 0;

    // Blocos extras
    const blocos = Math.floor(alma / 2);

    // Multiplicadores
    const { Md, Mh, Mt } = multiplicadores[estilo] || multiplicadores['Padrão'];

    // Rola 2d6 para cada bloco de Dano
    let baseDano = 0;
    for (let i = 0; i < blocosDano; i++) {
        baseDano += rolarDado(2, 6);
    }
    // Aplica multiplicador Md
    let danoMultiplicado = baseDano * Md;
    // Aplica bônus de 1d10% sobre o dano já multiplicado
    let bonusDano = Math.floor(danoMultiplicado * (rolarDado(1, 10) / 100));
    // Dano final
    let danoFinal = Math.floor(danoMultiplicado + bonusDano);

    // Defesa: (3 + blocosDefesa × 3) × Mh
    let defesaFinal = Math.floor((3 + blocosDefesa * 3) * Mh);

    // HP: (6 + blocosVitalidade × 6) × Mh
    let hpFinal = Math.floor((6 + blocosVitalidade * 6) * Mh);

    // Duração: (1 + blocosDuracao) × Mt
    let duracaoFinal = Math.floor((1 + blocosDuracao) * Mt);

    // Exibir resultado
    document.getElementById('resultado').innerHTML = `
        <strong>Estilo:</strong> ${estilo}<br>
        <strong>Alma Gasta:</strong> ${alma} (blocos extras: ${blocos})<br>
        <strong>Dano:</strong> ${danoFinal}<br>
        <strong>Defesa:</strong> ${defesaFinal}<br>
        <strong>HP:</strong> ${hpFinal}<br>
        <strong>Duração:</strong> ${duracaoFinal} turno(s)
    `;
});
