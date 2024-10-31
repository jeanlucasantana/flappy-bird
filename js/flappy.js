//funcao que cria um novo elemento baseado em uma div e uma classe
function novoElemento(tagName, className){
    const elemento = document.createElement(tagName)//cria o elemento no documento apartir da tag
    elemento.className = className//entra na propriedade do elemento e atribui a classe passada como parametro
    return elemento//retorna o elemento permitindo que as informacoes sejam acessadas por uma variavel por exemplo
}

//funcao para criar a barreira
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')//usamos a funcao novo elemento para criar a barreira
    const borda = novoElemento('div', 'borda')//usamos a funcao para criar o componente borda
    const corpo = novoElemento('div', 'corpo')//usamos a funcao para criar o componente corpo
    this.elemento.appendChild(reversa ? corpo : borda)//caso o parametro seja verdadeiro atribuimos o corpo senao a borda
    this.elemento.appendChild(reversa ? borda : corpo)//caso o parametro seja verdadeiro atribuimos a borda senao o corpo
    this.setAltura = altura => corpo.style.height = `${altura}px`//funcao para alterar a altura das barreiras
}

//funcao para criar o conjunto de barreiras
function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')//criamos o par de barreiras
    this.superior= new Barreira(true)//criamos a barreira superior
    this.inferior = new Barreira(false)//criamos a barreira inferior
    this.elemento.appendChild(this.superior.elemento)//adicionamos a barreira superior
    this.elemento.appendChild(this.inferior.elemento)//adicionamos a barreira inferior
    //funcao para sortear o tamanho das barreiras isso que define a dinamica das barreiras
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)//calculo para o tamanho da barreira superior
        const alturaInferior = altura - abertura - alturaSuperior//calculo para o tamanho da barreira inferior
        this.superior.setAltura(alturaSuperior)//usamos a funcao para modificar diretamente o tamanho do elemento
        this.inferior.setAltura(alturaInferior)//usamos a funcao para modificar diretamente o tamanho do elemento
    }
    this.getX = () => parseInt(this.elemento.style.left.split(`px`)[0])//funcao para pegar o valor da posicao horizontal
    this.setX = x => this.elemento.style.left = `${x}px`//funcao para alterar a posicao horizontal do elemento
    this.getLargura = () => this.elemento.clientWidth//funcao para pegar a largura da tela 
    this.sortearAbertura()//chamamos a funcao para gerar o tamanho das barreiras
    this.setX(x)//posicionamos as barreiras em relacao a esquerda da tela horizontalmente 
}

//funcao para criar o conjunto de barreiras do jogo
function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    //cria o conjunto de barreiras em relacao ao inicio do jogo espacando elas
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), 
        new ParDeBarreiras(altura, abertura, largura + espaco), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    const deslocamento = 5//define o deslocamento de pixels como 5
    //funcao para animar o jogo
    this.animar = () => {
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)//para cada barreira altera a posicao baseado em onde ele estava e no deslocamento
            //se a posicao do elemento for menor que a tela
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)//reposiciona o elemento em relacao aos outros
            }
            const meio = largura / largura//pega o inicio do jogo onde o passaro esta localizado
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio//se a barreira chegou ao inicio significa que passou pelo passaro
            if(cruzouOMeio) notificarPonto()//notifica o ponto
        })
    }
}

//funcao do passaro
function Passaro(alturaJogo){
    let voando = false//varivael para manipular o passaro
    this.elemento = novoElemento('img', 'passaro')//criamos o elemento
    this.elemento.src = 'imgs/passaro.png'//coloca a imagem do passaro
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])//funcao para pegar o eixo vertical em relacao ao inicio da pagina
    this.setY = y => this.elemento.style.bottom = `${y}px`//funcao para alterar o eixo vertical em relacao ao inicio da pagina
    window.onkeydown = e => voando = true//define a variavel como verdadeira caso o usuario esteja apertando uma tecla
    window.onkeyup = e => voando = false//define a variavel como falsa caso o usuario nao esteja apertando uma tecla
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)//aumenta em 8 pixels caso o passaro esteja voando decrementa em 5 pixels caso nao
        const alturaMaxima = alturaJogo - this.elemento.clientHeight//pega o tamanho maximo da tela
        if(novoY <= 0){
            this.setY(0)//evita que o passaro ultrapasse os limites do chao
        }
        else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)//evita que ele ultrapasse os limites do ceu
        }
        else{
            this.setY(novoY)//altera a posicao do passaro
        }
    }
    this.setY(alturaJogo/2)//inicia o passaro no meio da tela
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')//cria o progresso
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos//atualiza os pontos
    }
    this.atualizarPontos(0)//inicializa como 0
}

//funcao para checar a sobreposicao de elementos
function sobreposicao(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()//pega as dimensoes do elemento passado por parametro
    const b = elementoB.getBoundingClientRect()//pega as dimensoes do elemento passado por parametro
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left//verifica se o elemento bateu horizontalmente
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top//verifica se bateu verticalmente
    return horizontal && vertical//retorna as variaveis
}

//funcao para checar a colisao entre o passaro e as barreiras
function colidiu(passaro, barreiras){
    let colidiu = false//define a variavel como falsa
    //para cada par de barreira vai comparar checar a sobreposicao do passaro com as barreiras superiores e inferiores
    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu){
            const superior = ParDeBarreiras.superior.elemento//armazena a barreira superior
            const inferior = ParDeBarreiras.inferior.elemento//armazena a barreira inferior
            colidiu = sobreposicao(passaro.elemento, superior) || sobreposicao(passaro.elemento, inferior)//checa todos os casos de colisao
        }
    })
    return colidiu//retorna a variavel
}

function FlappyBird(){
    let pontos = 0//define pontos como 0
    const areaDoJogo = document.querySelector('[wm-flappy]')//pega a area do jogo
    const altura = areaDoJogo.clientHeight//pega a altura da div para usar como parametro
    const largura = areaDoJogo.clientWidth//pega a largura da div para usar como parametro
    const progresso = new Progresso()//cria o progresso
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos)
    )//cria as barreiras
    const passaro = new Passaro(altura)//cria o passaro
    areaDoJogo.appendChild(progresso.elemento)//adiciona o progresso na tela
    areaDoJogo.appendChild(passaro.elemento)//adiciona o passaro na tela
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))//adiciona as barreiras na tela
    //inicializa o jogo 
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()//usa a funcao animar para movimentar as barreiras
            passaro.animar()//usa a funcao para animar o passaro
            //confere se ha colisao durante a execucao
            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)//interrompe a execucao
            }
        }, 20)//determina a velocidade na qual os elementos sao manipulados
    }
}
new FlappyBird().start()//inicializa 









