# Vitrine da home - Validação

**Date**: 2026-10-27
**Spec**: `.specs/features/vitrine-home/spec.md`
**Diff range**: `755c7a8..0a9ac79` (HEAD `0a9ac79`; inclui `b957dcf`, `c0d8d2f`, `8e042fb`, `a015aa2`, `ad5048a`, `0a9ac79`)
**Verifier**: sub-agente independente (autor ≠ verificador). O `validation.md` anterior (FAIL obsoleto) foi sobrescrito e não foi usado como evidência.

**Baseline `git status --porcelain`** (antes de qualquer trabalho): `M .specs/LESSONS.md`, `M .specs/lessons.json`, `?? .specs/features/vitrine-home/validation.md`.

## Validation

**Result**: PASS

Motivo: os 14 ACs e os 3 casos de borda têm asserção com `file:line` que bate com o resultado da spec, o gate está verde (74 passed, 0 failed, 0 skipped) e os 10 mutantes injetados, inclusive o `fileira.filmes.length === 0` → `!== 0` do catálogo vazio, foram mortos.

---

## Task Completion

| Task | Status | Notas |
| ---- | ------ | ----- |
| T1 Montar a vitrine | ✅ Done | `lib/cartaz.mjs`, `lib/vitrine.ts`; "Done when" todos `[x]` e cobertos por `tests/vitrine.test.mjs` |
| T2 Trocar a home | ✅ Done | `app/page.tsx`, `components/fileira.tsx`, `components/poster.tsx`, `next.config.ts` |
| T3 Documentar a fonte | ✅ Done | `README.md:5` e `.specs/project/STATE.md:52` (AD-007) |

---

## Spec-Anchored Acceptance Criteria

### P1: Mostrar as listas do banco

| Critério (WHEN X THEN Y) | Resultado definido na spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| VIT-01 ordenar por `posicao` crescente e omitir `poster_path` nulo | destaque `[1, 2]` com posições 2,1,3 e a 3 sem pôster | `tests/vitrine.test.mjs:30-33` `assert.deepEqual(vitrine.destaque.map(f => f.id), [1, 2])` (entrada em `:21-23`, `posterPath: null` em `:23`); `:41-44` primeiros ids `[9, 1, 8, 7]` com `popular` desordenado (`:24-25`); `:71-72` `prisma.listaFilme.findMany` + `orderBy: { posicao: "asc" }` | ✅ PASS |
| VIT-02 destaque = `upcoming`; primeiro `w780`, demais `w500` | `…/w780/a.jpg` e `…/w500/b.jpg` | `tests/vitrine.test.mjs:34` `assert.equal(vitrine.destaque[0].src, "https://image.tmdb.org/t/p/w780/a.jpg")`; `:36` `assert.equal(vitrine.destaque[1].src, "https://image.tmdb.org/t/p/w500/b.jpg")` | ✅ PASS |
| VIT-03 fileiras em ordem Populares, Novidades, Bem avaliados, Em Cartaz, todas `w500` | títulos na ordem; todos `/w500/` | `tests/vitrine.test.mjs:37-40` `assert.deepEqual(…titulo, ["Filmes Populares","Novidades","Filmes Bem avaliados","Filmes em Cartaz"])`; `:45` `fileiras[1].filmes[0].src === …/w500/a.jpg`; `:46` `every(… src.includes("/w500/"))` | ✅ PASS |
| VIT-04 posição 1 do banco semeado | `1232569` upcoming, `969681` popular, `1560520` top_rated, `1058424` now_playing | `tests/vitrine.test.mjs:59-63` `assert.equal(vitrine.destaque[0].id, 1232569)`, `fileiras[0]…969681`, `fileiras[1]…1232569`, `fileiras[2]…1560520`, `fileiras[3]…1058424` (consulta ao PostgreSQL em `:53-57`) | ✅ PASS |
| VIT-05 URL `https://image.tmdb.org/t/p/{tamanho}{poster_path}` | string exata | `tests/vitrine.test.mjs:15` `assert.equal(urlDoPoster("/abc.jpg","w500"), "https://image.tmdb.org/t/p/w500/abc.jpg")`; `:16` idem `w780` | ✅ PASS |

### P1: Trocar a home pelos pôsteres

| Critério (WHEN X THEN Y) | Resultado definido na spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| VIT-06 carrossel `Novidades` com `primeiroMaior` e, abaixo, as quatro fileiras | destaque antes de `fileiras.map`; sem Drama/Ficção/Animação | `tests/home-fonte.test.mjs:12` `match(page, /titulo="Novidades"/)`; `:13` `match(page, /primeiroMaior[\s\S]*fileiras\.map/)`; `:14` `indexOf('titulo="Novidades"') < indexOf("fileiras.map")`; `:16-18` sem `Drama`/`Ficção`/`Animação`. Ordem das quatro fileiras em `tests/fileira-swiper.test.mjs:22` `populares < novidades && novidades < avaliados && avaliados < cartazLista` e `tests/vitrine.test.mjs:37-40` | ✅ PASS |
| VIT-07 primeiro slide `w-[14rem]`/`sm:w-[22rem]`; demais `w-[7.75rem]`/`sm:w-[11rem]` | ternário exato `primeiroMaior && index === 0 ? grande : pequeno` | `tests/home-fonte.test.mjs:22-25` `match(fileira, /primeiroMaior && index === 0\s*\?\s*"w-\[14rem\]! sm:w-\[22rem\]!"\s*:\s*"w-\[7\.75rem\]! sm:w-\[11rem\]!"/)` | ✅ PASS |
| VIT-08 pôster só imagem, `alt` = título, sem gênero/duração/sinopse | tags `figure, div, Image`; `alt={filme.titulo}` | `tests/home-fonte.test.mjs:29` `match(poster, /filme:\s*\{\s*titulo:\s*string;\s*src:\s*string\s*\}/)`; `:30` `match(poster, /alt=\{filme\.titulo\}/)`; `:32-35` `deepEqual(tags, ["figure","div","Image"])`; `:36` `page.includes("Hero") === false` | ✅ PASS |
| VIT-09 WHILE consulta: `Carregando o catálogo.` | texto exato dentro de `Suspense` | `tests/home-fonte.test.mjs:40` `page.includes("Carregando o catálogo.") === true`; `:41` `match(page, /<Suspense/)`. Fonte: `app/page.tsx:10` fallback do `Suspense` | ✅ PASS |
| VIT-10 destaque e fileiras vazios → `Nenhuma ficha neste catálogo.` | texto exato e predicado "destaque vazio E todas as fileiras vazias" | `tests/home-fonte.test.mjs:45` `includes("Nenhuma ficha neste catálogo.") === true`; `:46-49` `match(page, /destaque\.length === 0 && fileiras\.every\(\(fileira\) => fileira\.filmes\.length === 0\)/)`. Fonte: `app/page.tsx:19-20` | ✅ PASS |
| VIT-11 permitir `https://image.tmdb.org/t/p/**` em `next.config.ts` | `protocol https`, `hostname image.tmdb.org`, `pathname /t/p/**` | `tests/home-fonte.test.mjs:53` `match(config, /hostname:\s*"image\.tmdb\.org"/)`; `:54` `match(config, /pathname:\s*"\/t\/p\/\*\*"/)`; `:55` `match(config, /protocol:\s*"https"/)` | ✅ PASS |
| VIT-12 `app/page.tsx` consulta o Prisma e omite `@/lib/filmes` | `carregarVitrine` na página, `@/lib/prisma` em `lib/vitrine.ts`, sem import antigo | `tests/home-fonte.test.mjs:59` `match(page, /carregarVitrine/)`; `:60` `match(vitrine, /from "@\/lib\/prisma"/)`; `:61` `page.includes("@/lib/filmes") === false`; `:62` sem `generated/prisma` | ✅ PASS |

### P1: Registrar a troca da fonte

| Critério (WHEN X THEN Y) | Resultado definido na spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| VIT-13 `README.md` cita `Filmes Populares` e omite `A home continua lendo` | presença / ausência de frase | `tests/docs-contrato.test.mjs:26` `readme.includes("Filmes Populares") === true`; `:27` `readme.includes("A home continua lendo") === false` (README `:5`) | ✅ PASS |
| VIT-14 `STATE.md` registra `AD-007` com a home lendo as listas do PostgreSQL | seção `### AD-007` com a frase | `tests/docs-contrato.test.mjs:31-32` `match(state.split("### AD-007")[1], /home lê as listas do PostgreSQL/)` (`STATE.md:52-54`) | ✅ PASS |

### Casos de borda

- [x] Filme sem `poster_path` é omitido: `tests/vitrine.test.mjs:23` (entrada nula) + `:30-33` (`[1, 2]`); implementação `lib/cartaz.mjs:15`.
- [x] Fileira sem filmes não renderiza: `tests/fileira-swiper.test.mjs:62` `match(fileira, /if\s*\(\s*filmes\.length\s*===\s*0\s*\)\s*return null;/)` (`components/fileira.tsx` `if (filmes.length === 0) return null;`).
- [x] Catálogo inteiro sem pôster mostra `Nenhuma ficha neste catálogo.`: `tests/home-fonte.test.mjs:45-49` (texto + predicado do `app/page.tsx:19`).

**Status**: ✅ 14/14 ACs e 3/3 casos de borda cobertos com a asserção no resultado exato da spec.

**Observação (não é gap)**: os testes de P1 "Trocar a home" são contratos de fonte (regex sobre o código), padrão do projeto desde o experimento anterior (`tests/fileira-swiper.test.mjs`). A spec define textos e classes literais, e as asserções os travam literalmente. Nenhum AC ficou vago, então não há Spec-precision gap.

---

## Discrimination Sensor

Worktree temporário `git worktree add --detach /tmp/sensor-wt HEAD` (HEAD `0a9ac79`), com `node_modules` por symlink e `.env` copiado (arquivos ignorados, o `VIT-04` lê o banco). Linha de base no worktree: 74 pass, 0 fail. Cada mutante foi aplicado, `node --test` rodou e `git checkout -- .` reverteu antes do próximo. Sem `git stash`.

| # | File:line | Mutação | Resultado do spec | Teste que matou | Killed? |
| - | --------- | ------- | ----------------- | --------------- | ------- |
| M1 | `app/page.tsx:19` | `fileira.filmes.length === 0` → `!== 0` | muda VIT-10 | `VIT-10` (`tests/home-fonte.test.mjs:44`) | ✅ Killed |
| M2 | `app/page.tsx:25-29` | Fileira do destaque movida para depois de `fileiras.map` | muda VIT-06 | `VIT-06` (`tests/home-fonte.test.mjs:11`) | ✅ Killed |
| M3 | `components/fileira.tsx` (ternário do `className`) | strings de largura trocadas entre o primeiro slide e os demais | muda VIT-07 | `VIT-07` (`tests/home-fonte.test.mjs:21`) | ✅ Killed |
| M4 | `components/poster.tsx` | `<p>{sinopse}</p>` adicionado dentro do `figure` | muda VIT-08 | `VIT-08` (`tests/home-fonte.test.mjs:28`) | ✅ Killed |
| M5 | `lib/cartaz.mjs:32` | `w780` → `w500` | muda VIT-02 | `VIT-01 a VIT-03` (`tests/vitrine.test.mjs:19`) | ✅ Killed |
| M6 | `lib/cartaz.mjs:15` | removido `if (!linha.posterPath) continue;` | muda VIT-01 | suíte falhou (1 fail) | ✅ Killed |
| M7 | `lib/cartaz.mjs:21` | `a.posicao - b.posicao` → `b.posicao - a.posicao` | muda VIT-01 / VIT-04 | suíte falhou (2 fails) | ✅ Killed |
| M8 | `components/poster.tsx` | `alt={filme.titulo}` → `alt=""` | muda VIT-08 | suíte falhou (1 fail) | ✅ Killed |
| M9 | `lib/cartaz.mjs:32` | `index === 0` → `index === 1` no `w780` | muda VIT-02 | suíte falhou (1 fail) | ✅ Killed |
| M10 | `app/page.tsx:10` | `Carregando o catálogo.` → `Carregando.` | muda VIT-09 | suíte falhou (1 fail) | ✅ Killed |

Fora do julgamento, por não definirem resultado da spec (não contam como gap): mudar `sizes` da imagem (a spec não define `sizes`) e remover `destaque.length > 0` em volta da Fileira do topo (`Fileira` já devolve `null` com `filmes.length === 0`).

**Isolamento**: worktree removido (`git worktree remove --force` + `prune`; `git worktree list` mostra só a árvore principal). `git status --porcelain` depois do sensor é idêntico ao baseline. Re-execução na árvore real: `node --test tests/vitrine.test.mjs` → 4 tests, 4 pass, 0 fail; porcelain ainda idêntico ao baseline.

**Sensor depth**: lightweight ampliado (10 mutações, todas em código novo da feature)
**Result**: 10/10 killed - PASS ✅

---

## Code Quality

| Princípio | Status |
| --------- | ------ |
| Minimum code | ✅ `lib/cartaz.mjs` (38 linhas) e `lib/vitrine.ts` fazem só a montagem e a consulta; `Poster` reduzido a imagem |
| Surgical changes | ✅ A home trocou o hero e o array local; `Fileira` ganhou só `primeiroMaior` e `rotulo` |
| No scope creep | ✅ Sem página de filme, clique, busca ou backdrop (Out of Scope respeitado) |
| Matches patterns | ✅ Contratos de fonte iguais aos de `tests/fileira-swiper.test.mjs`; consulta pelo Prisma (AD-006/AD-007) |
| Spec-anchored outcome check (asserted values match spec) | ✅ tabela acima |
| Per-layer Coverage Expectation (domain 1:1 ACs) | ✅ montagem: VIT-01..05; home: VIT-06..12; docs: VIT-13/14, como na Test Coverage Matrix de `tasks.md` |
| Every test maps to a spec requirement - no unclaimed tests | ✅ os testes novos citam VIT-01..14; os testes antigos tocados (`SWP-01`, `SWP-05`, `CAT-38`) foram ajustados para o novo layout |
| Documented guidelines followed | `AGENTS.md` (Next.js: `cacheComponents` exige `Suspense` na leitura do banco, atendido em `app/page.tsx:10`) |

---

## Gate Check

- **Gate command**: `npm run lint && node --test && npm run build` (Build gate de `tasks.md`)
- **Result**: exit 0. `node --test`: 74 passed, 0 failed, 0 skipped, 0 cancelled. Lint sem erros. `next build` compilou, TypeScript ok, rota `/` como Partial Prerender.
- **Test count before feature** (declarações `test(` em `tests/` em `b957dcf^`): 51
- **Test count after feature** (declarações `test(` em `tests/` em HEAD): 62
- **Delta**: +11 testes (`vitrine.test.mjs` +4, `home-fonte.test.mjs` +5 líquidos: 7 novos VIT-06..12 menos `DB-21` e `DB-22`, `docs-contrato.test.mjs` +2)
- **Testes removidos**: `DB-21` (home importa `@/lib/filmes`) e `DB-22` (home não importa Prisma) foram substituídos por `VIT-12`, justificado pela AD-007 e pela spec (VIT-12 exige o contrário). Nenhuma asserção ficou mais fraca fora desse caso.
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans

Nenhum gap encontrado. Nenhuma tarefa de correção criada.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| VIT-01 a VIT-14 | Implementing | ✅ Verified (evidência na tabela de ACs) |

Obs.: `spec.md` não foi alterado por esta validação.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 14/14 ACs e 3/3 casos de borda batem com o resultado da spec
**Sensor**: 10/10 mutações mortas (inclui `!== 0` do VIT-10)
**Gate**: 74 passed, 0 failed, 0 skipped

**What works**: a home lê as listas do PostgreSQL, abre com o carrossel de Novidades com o primeiro pôster `w780` maior, mostra as quatro fileiras na ordem pedida e só com imagem, e README e STATE.md registram a troca.

**Issues found**: nenhum.

**Next steps**: nenhum.
