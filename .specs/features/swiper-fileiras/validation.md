# Swiper Fileiras: Relatório do Verificador

**Result**: PASS

**Date**: 2026-10-27
**Spec**: `.specs/features/swiper-fileiras/spec.md`
**Diff range**: árvore de trabalho não commitada contra `HEAD` (`app/globals.css`, `components/fileira.tsx`, `components/poster.tsx`, `package.json`, `package-lock.json` modificados; `tests/fileira-swiper.test.mjs` e `.specs/features/swiper-fileiras/` novos). Não há `tasks.md` (fase Tasks pulada por decisão do pedido).
**Verifier**: subagente independente (autor ≠ verificador), segunda passada após o FAIL anterior e o reforço de `tests/fileira-swiper.test.mjs`. Tudo rederivado; nenhum commit, push ou stash.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| (sem `tasks.md`) | ⚠️ N/A | Verificado contra os 5 ACs e 3 edge cases da spec. |

---

## Spec-Anchored Acceptance Criteria

Os testes leem o texto-fonte (`readFileSync`) e aplicam regex; a spec (Independent Test) diz que `node --test tests/fileira-swiper.test.mjs` "confere o contrato do componente". Agora as regex ancoram o desfecho exato (ramo do ternário, linha do `return null`, botão ↔ método) e o sensor confirma que quebrar o comportamento derruba os testes.

### P1: Fileiras no Swiper

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 WHEN abre a raiz THEN mostra Drama, Ficção e Animação com pôsteres dentro de um Swiper | três `Fileira` na home; `Swiper`/`SwiperSlide` de `swiper/react`; `slidesPerView="auto"`, `slidesPerGroupAuto`, `wrapperTag="ul"`, slide `li`; pôster não é `li` | `tests/fileira-swiper.test.mjs:14` - `assert.match(page, /<Fileira/)`; `:15-17` - `titulo:\s*"Drama"`, `"Ficção"`, `"Animação"`; `:18-21` - `import { Swiper, SwiperSlide } from "swiper/react"`; `:23` - `slidesPerView="auto"`; `:24` - `assert.match(fileira, /slidesPerGroupAuto(?!=\{false\})/)`; `:25-26` - `wrapperTag="ul"`, `tag="li"`; `:27` - `assert.equal(/<li[\s>]/.test(poster), false)`; `:13` - `typeof pkg.dependencies.swiper === "string"`. Código: `components/fileira.tsx:63-67,88-92`, `app/page.tsx:7-9` | ✅ PASS |
| AC2 WHEN aciona o botão da direita ou da esquerda THEN move o grupo visível nessa direção e para na extremidade | esquerda → `slidePrev`, direita → `slideNext`; `slidesPerGroupAuto` ligado; `watchOverflow` ligado; sem loop/autoplay | `tests/fileira-swiper.test.mjs:40-43` - trecho de 180 caracteres antes de cada rótulo (`:30-35`): esquerda `match /slidePrev\(\)/` e sem `slideNext()`; direita `match /slideNext\(\)/` e sem `slidePrev()`; `:44` - `assert.match(fileira, /watchOverflow(?!=\{false\})/)`; `:45` - sem `autoplay`; `:46` - sem `loop`; `:24` - `slidesPerGroupAuto(?!=\{false\})`. Código: `components/fileira.tsx:48-49,56-57,67,80` | ✅ PASS |
| AC3 WHILE `prefers-reduced-motion: reduce` THEN troca a posição sem animação | `speed = 0` quando a mídia casa; `VELOCIDADE` (300) quando não casa | `tests/fileira-swiper.test.mjs:50-53` - `assert.match(fileira, /swiper\.params\.speed\s*=\s*media\.matches\s*\?\s*0\s*:\s*VELOCIDADE/)`. Código: `components/fileira.tsx:11,27` | ✅ PASS |
| AC4 IF a fileira não tem filmes THEN não renderiza a seção | `Fileira` retorna `null` com `filmes.length === 0` | `tests/fileira-swiper.test.mjs:57` - `assert.match(fileira, /if\s*\(\s*filmes\.length\s*===\s*0\s*\)\s*return null;/)`. Código: `components/fileira.tsx:34` | ✅ PASS |
| AC5 The sistema SHALL manter o título e os rótulos `Rolar ${titulo} para a esquerda` / `para a direita` | `aria-labelledby` ligado ao título; os dois rótulos exatos | `tests/fileira-swiper.test.mjs:61` - ``/aria-labelledby=\{`fileira-\$\{titulo\}`\}/``; `:62` - `/Rolar \$\{titulo\} para a esquerda/`; `:63` - `/Rolar \$\{titulo\} para a direita/`. Código: `components/fileira.tsx:37,49,57` | ✅ PASS |

**Status**: ✅ 5/5 ACs com desfecho ancorado na spec. Nenhum spec-precision gap.

### Edge Cases (spec)

| Edge case | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| Todos os pôsteres cabem THEN setas ficam, sem loop | `watchOverflow` ligado; sem `loop` | `tests/fileira-swiper.test.mjs:44` - `/watchOverflow(?!=\{false\})/`; `:46` - sem `loop` | ✅ PASS |
| Celular: pôster `7.75rem`, espaço `8px`, recuo `16px` | valores exatos | `tests/fileira-swiper.test.mjs:67` - `/w-\[7\.75rem\]/`; `:69` - `/spaceBetween=\{8\}/`; `:70-71` - `/slidesOffsetBefore=\{16\}/`, `/slidesOffsetAfter=\{16\}/` | ✅ PASS |
| `640px` ou mais: pôster `11rem`, espaço `12px`, recuo `48px` | valores exatos dentro da chave `640` | `tests/fileira-swiper.test.mjs:68` - `/sm:w-\[11rem\]/`; `:72-76` - bloco `640:\s*\{...\}` com `spaceBetween:\s*12`, `slidesOffsetBefore:\s*48`, `slidesOffsetAfter:\s*48` | ✅ PASS |

---

## Discrimination Sensor

Baseline: `git status --porcelain` gravado antes (11 entradas, incluindo `.claude/napkin.md`, `.specs/LESSONS.md`, `.specs/lessons.json`, já modificados antes da passada). Scratch `mktemp -d /tmp/sensor.XXXXXX` com cópia de `tests/fileira-swiper.test.mjs`, `components/fileira.tsx`, `components/poster.tsx`, `app/page.tsx`, `app/globals.css` e `package.json`; só a cópia de `components/fileira.tsx` no scratch foi mutada, restaurada do original entre mutações. Comando: `node --test <scratch>/tests/fileira-swiper.test.mjs`. Sanidade sem mutação: 6 passam, 0 falham. Sem `git stash`, sem `git worktree` (a feature não está no `HEAD`).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `components/fileira.tsx:27` | `media.matches ? 0 : VELOCIDADE` → `media.matches ? VELOCIDADE : 0` | ✅ Killed (SWP-03, `tests/fileira-swiper.test.mjs:50-53`; 5 pass, 1 fail) |
| 2 | `components/fileira.tsx:56` | seta da direita: `slideNext()` → `slidePrev()` (esquerda continua `slidePrev`) | ✅ Killed (SWP-02, `tests/fileira-swiper.test.mjs:42`; 5 pass, 1 fail) |
| 3 | `components/fileira.tsx:34` | `if (filmes.length === 0) return null;` → `if (filmes.length === 0 && false) return null;` | ✅ Killed (SWP-04, `tests/fileira-swiper.test.mjs:57`; 5 pass, 1 fail) |
| 4 | `components/fileira.tsx:67,80` | `slidesPerGroupAuto` → `slidesPerGroupAuto={false}` e `watchOverflow` → `watchOverflow={false}` | ✅ Killed (SWP-01 `:24` e SWP-02 `:44`; 4 pass, 2 fail). Isolados: só `slidesPerGroupAuto={false}` mata SWP-01; só `watchOverflow={false}` mata SWP-02 |

**Sensor depth**: lightweight (4 mutações pedidas, mais 2 isoladas de 4).
**Result**: 4/4 mortos, 0 sobreviveram - PASS ✅

**Isolamento**: scratch removido (`/tmp/sensor.*` não existe mais). `git status --porcelain` depois idêntico ao baseline (`diff` sem saída).

**Observação residual (não bloqueia)**: a guarda `(?!=\{false\})` não pegaria `={0}` ou `={undefined}`; fora das mutações pedidas e do contrato da spec.

---

## Interactive UAT Results

Pulado: sem usuário nesta passada.

| #   | Test | Result | Details |
| --- | ---- | ------ | ------- |
| 1   | UAT da home no navegador | ⏭️ Skip | Sem sessão de usuário |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `components/fileira.tsx` sem abstração extra |
| Surgical changes | ✅ `fileira-scroll` removido de `app/globals.css` por falta de uso (`tests/fileira-swiper.test.mjs:78`); `Poster` deixou de ser `li` |
| No scope creep | ✅ sem loop, autoplay, paginação |
| Matches patterns | ✅ nomes em português, classes Tailwind existentes |
| Spec-anchored outcome check (asserted values match spec) | ✅ 5/5 ACs e 3 edge cases |
| Per-layer Coverage Expectation met | ✅ contrato de componente por espelho de texto, aceito pela spec (Independent Test), com sensor comportamental 4/4 |
| Every test maps to a spec requirement - no unclaimed tests | ✅ SWP-01..05 mais o teste de medidas (edge cases) |
| Documented guidelines followed | AGENTS.md citado; sem outro guia de teste no repo |

Observação sem impacto no veredito: `package-lock.json` traz ruído além do `swiper` (típico de regeneração do npm). `data/` untracked está fora do escopo. `tsc`, lint e build não fazem parte do gate pedido.

---

## Edge Cases

- [x] Todos os pôsteres cabem: `watchOverflow` travado em `tests/fileira-swiper.test.mjs:44`
- [x] Medidas de celular: `tests/fileira-swiper.test.mjs:67,69-71`
- [x] Medidas de `640px`+: `tests/fileira-swiper.test.mjs:68,72-76`

---

## Gate Check

- **Gate command**: `node --test` (raiz do repo)
- **Result**: 31 passaram, 0 falharam, 0 pulados
- **Test count before feature**: 25
- **Test count after feature**: 31
- **Delta**: +6 novos testes (`tests/fileira-swiper.test.mjs`); nenhum teste removido
- **Skipped tests**: nenhum
- **Failures**: nenhuma

---

## Fix Plans

Nenhum.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SWP-01 | Verified | ✅ Verified |
| SWP-02 | Needs Fix | ✅ Verified |
| SWP-03 | Needs Fix | ✅ Verified |
| SWP-04 | Needs Fix | ✅ Verified |
| SWP-05 | Verified | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 ACs batem o desfecho; 0 spec-precision gaps
**Sensor**: 4/4 mutações mortas
**Gate**: 31 passaram, 0 falharam

**What works**: `node --test` verde (31/31, +6 sobre 25). Os três mutantes que sobreviveram na passada anterior (ternário de `speed`, retorno `null`, `slidesPerGroupAuto`/`watchOverflow`) agora são mortos; a troca de direção da seta também.

**Issues found**: nenhuma bloqueante.

**Next steps**: nenhum. Lição: PASS limpo, nada a registrar.
