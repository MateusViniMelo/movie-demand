# recomendacoes verification

**Verdict**: PASS
**Mutations**: 3 - probed C13, C19, C20
**Round**: 2
**Proofs**: `proofs.md` at 95a35d5
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| O peso do gênero pode usar o tamanho do candidato e REC-13 continua verde | mutation `peso do gênero usa o candidato` not killed (`lib/recomendacoes.mjs:96`). REC-13 só mede conjuntos do mesmo tamanho (2 e 2, 1 e 1). Origem `[1,2,3]` e candidato `[1]` valem `1/3`; o mutante vale `1` | afirmar a parte de gênero `1/3` com origem de 3 gêneros e candidato de 1 | C13 |
| O desempate por `pessoaId` pode sumir e REC-19 continua verde | mutation `desempate de elenco ignora pessoaId` not killed (`lib/recomendacoes.mjs:81`). Os ids do teste já entram em ordem crescente. Inserção `50,40,30,20,10,1` na mesma ordem: `1` fica nos 5 e `50` fica de fora | afirmar elenco `0.15` para o `pessoaId` 1 e `0` para o 50 nesse elenco | C19 |
| Coleção em comum, sem gênero, pode deixar de incluir e REC-20 continua verde | mutation `coleção deixa de incluir o candidato` not killed (`lib/recomendacoes.mjs:113`). REC-20 só vê a exclusão de elenco sozinho e de nota zero. Origem `colecaoId` 9 e gêneros `[4]`, candidato `colecaoId` 9 e gêneros `[8]`, entra hoje | afirmar que esse candidato permanece na lista | C20 |
| Vitrine vazia com filme guardado não pede a fileira | `app/page.tsx:48` retorna antes de `<Recomendacoes />`. AC 5. REC-05 não percorre esse ramo | montar `Recomendacoes` também no catálogo vazio e falhar o teste se o ramo não o inclui | C5 |
| Releitura mantém os pôsteres anteriores e uma resposta antiga pode vencer | `components/recomendacoes.tsx:24` só chama `setFilmes` depois do `fetch`. AC 6 e a decisão «Enquanto carrega: nenhum pôster». REC-06 só confere o `useState` inicial `[]` | esvaziar a lista ao disparar o pedido, ignorar resposta obsoleta, e falhar o teste se a lista anterior permanecer | C6 |
| C11 não exige a releitura | `tests/recomendacoes.test.mjs:115` aceita o predicado e o texto `eventoAtualizaRecomendacao(evento.key)`; remover `carregar()` mantém o teste verde. AC 11 | falhar REC-11 se o handler da chave não relê o filme | C11 |
