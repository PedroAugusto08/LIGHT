import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import HabilidadesTab from '../components/HabilidadesTab'
import PersonagemTab from '../components/PersonagemTab'

export default function Home() {
  // Removido carregamento manual duplicado (Next Script já injeta)
  useEffect(()=>{},[]);
  return (
    <>
      <Head>
        <title>Forjador de Construtos</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <Script src="/script.js?v=20250904" strategy="afterInteractive" onLoad={() => {
        // Garante que os vários listeners que esperam DOMContentLoaded rodem no Next
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          const evt = new Event('DOMContentLoaded');
          window.dispatchEvent(evt);
          document.dispatchEvent(evt);
        }
      }} />
      <Script src="/testes.js?v=20250904" strategy="afterInteractive" />
      <div className="bg-layer" aria-hidden="true"></div>
      <div className="tabs-container">
        <div className="tabs-bar">
          <button className="tab-btn active" data-tab="personagem">Personagem</button>
          <button className="tab-btn" data-tab="forja">Forja</button>
          <button className="tab-btn" data-tab="testes">Testes</button>
          <button className="tab-btn" data-tab="habilidades">Habilidades</button>
          <button className="tab-btn" data-tab="historico">Histórico de Construtos</button>
        </div>
        <div className="tabs-content">
          <div className="tab-pane" id="tab-personagem" style={{display:'flex'}}>
            <PersonagemTab />
          </div>
          <div className="tab-pane" id="tab-forja" style={{display:'none'}}>
            <div className="main-flex">
              <div className="container">
                <h1>Forjador de Construtos</h1>
                <form id="forgeForm" onSubmit={(e)=>e.preventDefault()}>
                  <label htmlFor="estilo">Estilo do Construto</label>
                  <div className="select-wrapper">
                    <select id="estilo" name="estilo">
                      <option value="Projétil">Projétil</option>
                      <option value="Padrão">Padrão</option>
                      <option value="Pesado">Pesado</option>
                      <option value="Área">Área</option>
                      <option value="Colossal">Colossal</option>
                      <option value="Estrutura">Estrutura</option>
                    </select>
                    <span className="select-caret" aria-hidden="true"></span>
                  </div>
                  <label htmlFor="almaExtra">Alma Extra</label>
                  <input type="number" id="almaExtra" name="almaExtra" min="0" defaultValue="0" required />
                  <div id="blocos-info"></div>
                  <label htmlFor="dano">Blocos em Dano</label>
                  <input type="number" id="dano" name="dano" min="0" defaultValue="0" required />
                  <div className="hybrid-control">
                    <input type="range" id="danoSlider" min="0" max="0" defaultValue="0" step="1" />
                    <div className="block-bar" id="danoBar"></div>
                  </div>
                  <label htmlFor="defesa">Blocos em Defesa</label>
                  <input type="number" id="defesa" name="defesa" min="0" defaultValue="0" required />
                  <div className="hybrid-control">
                    <input type="range" id="defesaSlider" min="0" max="0" defaultValue="0" step="1" />
                    <div className="block-bar" id="defesaBar"></div>
                  </div>
                  <label htmlFor="vitalidade">Blocos em Vitalidade</label>
                  <input type="number" id="vitalidade" name="vitalidade" min="0" defaultValue="0" required />
                  <div className="hybrid-control">
                    <input type="range" id="vitalidadeSlider" min="0" max="0" defaultValue="0" step="1" />
                    <div className="block-bar" id="vitalidadeBar"></div>
                  </div>
                  <label htmlFor="duracao">Blocos em Duração</label>
                  <input type="number" id="duracao" name="duracao" min="0" defaultValue="0" required />
                  <div className="hybrid-control">
                    <input type="range" id="duracaoSlider" min="0" max="0" defaultValue="0" step="1" />
                    <div className="block-bar" id="duracaoBar"></div>
                  </div>
                  <button type="submit" id="forjarBtn">Forjar Construto</button>
                </form>
              </div>
              <div className="result" id="resultado">
                <h2 className="card-title">Resultado</h2>
                <div id="resultadoContent"></div>
              </div>
            </div>
          </div>
          <div className="tab-pane" id="tab-testes" style={{display:'none'}}>
            <div className="main-flex">
              <div className="container">
                <h2>Testes Interativos</h2>
                <form id="testsForm" onSubmit={(e)=>e.preventDefault()}>
                  <label htmlFor="teste-pericia">Perícia</label>
                  <div className="select-wrapper">
                    <select id="teste-pericia"></select>
                    <span className="select-caret" aria-hidden="true"></span>
                  </div>
                  <label htmlFor="teste-atributo">Atributo</label>
                  <div className="select-wrapper">
                    <select id="teste-atributo"></select>
                    <span className="select-caret" aria-hidden="true"></span>
                  </div>
                  {/* Perícia perito agora é configurada no código (public/testes.js → PERICIAS_PERITO) */}
                  <label htmlFor="teste-vantagens">Vantagens</label>
                  <input type="number" id="teste-vantagens" min="0" defaultValue="0" />
                  <label htmlFor="teste-desvantagens">Desvantagens</label>
                  <input type="number" id="teste-desvantagens" min="0" defaultValue="0" />
                  <label htmlFor="teste-bonus">Bônus adicional (opcional)</label>
                  <input type="number" id="teste-bonus" defaultValue="0" />
                  <button type="submit" id="rolarTesteBtn">Rolar Teste</button>
                  <button type="button" id="addFavoritoBtn" className="sec">Adicionar aos Favoritos</button>
                  <div className="inline" style={{marginTop:'8px'}}>
                    <label>
                      <input type="checkbox" id="teste-no-discord" /> Não enviar ao Discord
                    </label>
                  </div>
                </form>
              </div>
              <div className="right-col">
                <div className="favoritos-container">
                  <h2>Favoritos</h2>
                  <div id="favoritos-vazio" className="favoritos-empty">Nenhum favorito ainda.</div>
                  <div id="favoritos-list"></div>
                </div>
                <div id="resultadoTeste">
                  <h2 className="card-title">Resultado</h2>
                  <div id="resultadoTesteContent"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane" id="tab-habilidades" style={{display:'none'}}>
            <HabilidadesTab />
          </div>
          <div className="tab-pane" id="tab-historico" style={{display:'none'}}>
            <div className="historico-container">
              <h2>Histórico de Construtos</h2>
              <div className="historico-actions">
                <button id="limparHistoricoBtn" type="button" className="clear-history-btn">Limpar histórico</button>
              </div>
              <div id="historico-list"></div>
              <div id="historico-total" style={{marginTop:'18px',fontWeight:'bold'}}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
