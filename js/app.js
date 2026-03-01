// Produtos (por enquanto repetimos aqui)
// Depois eu te ensino a centralizar pra não duplicar.
const produtos = [
  { id: 1, nome: "Perfume Elegance", marca: "Marca A", volume: "100ml", preco: 199.90 },
  { id: 2, nome: "Perfume Intense",  marca: "Marca B", volume: "50ml",  preco: 149.90 },
  { id: 3, nome: "Perfume Gold",     marca: "Marca C", volume: "100ml", preco: 289.90 }
];

const homeGrid = document.querySelector("#homeGrid");

function formatarPreco(valor){
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

if(homeGrid){
  // pega 3 destaques (pode mudar depois)
  const destaques = produtos.slice(0, 3);

  destaques.forEach(p => {
    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card__img"></div>
      <div class="card__body">
        <strong>${p.nome}</strong>
        <span class="muted">${p.marca} • ${p.volume}</span>
        <span class="price">${formatarPreco(p.preco)}</span>
        <a class="btn btn--small" href="catalogo.html">Ver no catálogo</a>
      </div>
    `;

    homeGrid.appendChild(card);
  });
}