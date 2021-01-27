//funcao se autoexecuta
// dentro da chaves so fará parte desse contexto, não pode ser acessada por exemplo no console
// IIFE => Immeately invoked function expression
(() => {



    const BTN_REINICIAR = "btnReiniciar"
    const ID_CONTADOR = "contador"
    const VALOR_CONTADOR = 100
    const PERIODO_INTERVALO = 10

    class ContadorComponent {

        constructor() {
            this.inicializar()
        }

        //tipo um middleware
        prepararContadorProxy() {
            const handler = {
                set: (currentContext, propertyKey, newValue) => {
                    console.log({ currentContext, propertyKey, newValue })
                    //parar todo o processamento

                    if (!currentContext.valor) {
                        currentContext.efetuarParada()
                    }
                    currentContext[propertyKey] = newValue
                    return true
                }
            }
            //obj proxy observa uma instancia e cada vez que for alterado sera executado uma função
            const contador = new Proxy({
                valor: VALOR_CONTADOR,
                efetuarParada: () => { }
            }, handler)

            return contador
        }

        // na primeira chamada guarda os valores pois na segunda chamada não teremos esses valores
        atualizarTexto = ({ elementoContador, contador }) => () => {

            const identificadorTexto = '$$contador'
            const textoPadrao = `Começando em <strong>${identificadorTexto}</strong> segundos`
            elementoContador.innerHTML = textoPadrao.replace(identificadorTexto, contador.valor--)
        }

        agendarParadaContador({ elementoContador, idIntervalo }) {
            // igual a funcao atualizarTexto, mas jeito mais facil de visualizar

            //currying ou closure
            return () => {
                clearInterval(idIntervalo)
                elementoContador.innerHTML = ''
                this.desabilitarBotao(false)
            }

        }

        prepararBotao(elementoBotao, iniciarFn) {
            //colocando bind será forçado o this ser a classe do compomente 
            elementoBotao.addEventListener('click', iniciarFn.bind(this))

            return (valor = true) => {
                const atributo = 'disable'

                if (valor) {
                    elementoBotao.setAttribute(atributo, valor)
                    return;
                }

                elementoBotao.removeAttribute(atributo)
            }
        }

        inicializar() {

            console.log('inicializou')

            const elementoContador = document.getElementById(ID_CONTADOR)

            //sem usar o bind, esse this corresponde as propriedades do botao
            const contador = this.prepararContadorProxy()
            // contador.valor = 100
            // contador.valor = 90
            // contador.valor = 80

            const argumentos = {
                elementoContador,
                contador
            }

            const fn = this.atualizarTexto(argumentos)

            const idIntervalo = setInterval(fn, PERIODO_INTERVALO)
            // dentro de chaves posso criar variaveis com o mesmo nome
            {
                const elementoBotao = document.getElementById(BTN_REINICIAR)

                const desabilitarBotao = this.prepararBotao(elementoBotao, this.inicializar)
                desabilitarBotao()
                const argumentos = {
                    elementoContador, idIntervalo
                }

                //const desabilitarBotao = () => console.log('desabilitou')
                // aply substitui o que tem no this pelo valor passado no apply, criando um novo contexto 
                const pararContadorFn = this.agendarParadaContador.apply({ desabilitarBotao }, [argumentos])
                contador.efetuarParada = pararContadorFn
            }

        }
    }

    window.ContadorComponent = ContadorComponent
})()