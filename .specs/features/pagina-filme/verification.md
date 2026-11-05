# pagina-filme verification

**Verdict**: PASS
**Mutations**: 3 - probed C1 (poster id), C3 (search row id), C4/C7 (page still size); round 2 re-runs them
**Round**: 2
**Proofs**: `proofs.md` at 67d71cb
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| The id feeding the poster link can be wrong and C1 stays green | mutation `lib/cartaz.mjs cartaz(): id: linha.id -> linha.posicao` not killed by `node --test --test-name-pattern "PAG-01" tests/filme-ui.test.mjs`; PAG-01 only greps `components/poster.tsx` for `href={caminhoDoFilme(filme.id)}` | Add a PAG-01 case that runs `montarVitrine` on rows with distinct `id` and `posicao` and asserts every `destaque` and `fileiras[].filmes[]` item has `id === linha.id`, and `caminhoDoFilme(item.id)` is `/filme/{id}`. Same for `hero[].id` (PAG-02), which is also unproven | C1, C2 |
| The id on a search row can be wrong and C3 stays green | mutation `lib/busca.mjs: id: Number(linha.id) -> Number(linha.id) + 1` not killed by the PAG-03 proof; PAG-03 only greps `LinhaBusca` source for the `href` | Assert the output of the search row mapper keeps `id` equal to the row id and that `caminhoDoFilme` of it is `/filme/{id}` for a non-trivial id | C3 |
| The still size on the page can change and C4/C7 stay green | mutation `app/filme/[id]/page.tsx: src={ficha.fundo} -> src={ficha.fundo.replace("w1280","w500")}` not killed by the PAG-07 proof; no page test pins that `Image` gets `ficha.fundo` unchanged (PAG-04 proves only `fichaDoFilme`) | In `tests/filme-ui.test.mjs` assert `src={ficha.fundo}` literally on the `Image`, with no transform of `fundo` | C7 |
| Id inside the safe-integer range but above `Int` (e.g. `2147483648`) does not answer not found | own example: `curl localhost:3000/filme/2147483648` renders the unhandled error (`PrismaClientKnownRequestError`, value out of range, digest `527869996`) while `/filme/999999999` returns `NEXT_HTTP_ERROR_FALLBACK;404`. `idDoFilme("2147483648")` returns `2147483648`, `filmes.id` is `Int` (`prisma/schema.prisma` `model Filme`), so `carregarFilme` throws. Violates AC 9 (no film has this id -> not found) and the intent of AC 8 | Reject ids above `2147483647` in `idDoFilme` (or catch the out of range error in `carregarFilme` and return null) and add `idDoFilme("2147483648") === null`, `idDoFilme("2147483647") === 2147483647` to the PAG-08 test | C8 |
| C1, C2, C3 prove links at the source-text layer only, with loose windows | `tests/filme-ui.test.mjs` PAG-01..03 and PAG-13 use `assert.match` on file text; PAG-13 looks only 420 chars before the label for `<button`; PAG-12 is `includes("Carregando o filme…")` plus `<Suspense`, without tying the text to the `fallback` prop. The matrix names unit for the layer, but the id value that reaches the `href` is never exercised (see first two findings) | Tie PAG-12 to `fallback={` containing the text; for PAG-13 match the `<button` that owns each label, not a character window | C12, C13 |

## Own examples

- `idDoFilme` at the other side of the safe bound: `9007199254740991` returns the number, `9007199254740992` is null, `+5`, `5\n`, `0x10`, `1e3`, `undefined` and `["5"]` are null. Held.
- AC 9 with an id never named by the spec or checks (`2147483648`, `4294967296`, `9007199254740991`): `999999999` answers 404; `2147483648` throws instead of 404. Broke (finding above).
- Throwaway files were removed; mutations restored byte for byte (grep confirmed none of the mutated snippets remain).
