# Avaliação Experimental do Uso de Cache Redis na Recuperação de Metadados em um Sistema de Informação Multimídia sob Demanda

## 1. Identificação do trabalho

* **Disciplina:** Redes Multimídia — EN05228
* **Instituição:** Universidade Federal do Pará (UFPA)
* **Tema:** 10 — Sistemas de Informação Multimídia sob Demanda e Personalização de Conteúdo
* **Implementação:** Catálogo de filmes desenvolvido com Next.js
* **Banco de dados:** PostgreSQL
* **Tecnologia de cache:** Redis, utilizando Upstash
* **Hospedagem da aplicação:** Vercel

---

## 2. Contextualização

Sistemas de informação multimídia sob demanda permitem que usuários solicitem e recuperem conteúdos de acordo com suas necessidades. Entre esses sistemas, os catálogos de filmes representam uma aplicação que combina mecanismos de busca, recuperação de informações e disponibilização de diferentes tipos de conteúdo multimídia.

Um catálogo de filmes pode disponibilizar metadados como título, sinopse, gênero, elenco, imagens e referências para trailers. A recuperação dessas informações envolve consultas ao banco de dados e, dependendo da implementação, operações de junção entre diferentes tabelas.

Neste trabalho, será utilizado um catálogo de filmes desenvolvido com Next.js e hospedado na Vercel. Os dados foram previamente extraídos da API do The Movie Database (TMDB), por meio de um processo de seed, e armazenados em um banco de dados PostgreSQL.

A pesquisa propõe investigar o impacto da utilização de uma camada de cache Redis na recuperação dessas informações, comparando o desempenho da arquitetura atual com uma arquitetura que utiliza cache distribuído.

## 3. Problema de pesquisa

A recuperação de metadados em sistemas multimídia sob demanda pode envolver consultas ao banco de dados, processamento de resultados e comunicação entre componentes distribuídos.

Quando determinadas informações são solicitadas repetidamente, a execução contínua das mesmas consultas pode representar um custo adicional de processamento e comunicação.

Uma alternativa para reduzir esse custo consiste na utilização de mecanismos de cache, que armazenam temporariamente resultados previamente recuperados.

Entretanto, a adoção de uma camada de cache não garante, por si só, uma melhoria significativa de desempenho. Os resultados podem variar conforme a complexidade das consultas, a frequência de acesso aos dados, a latência de comunicação e a configuração da infraestrutura.

Dessa forma, torna-se necessário avaliar experimentalmente o comportamento do sistema com e sem a utilização de Redis.

### 3.1. Pergunta de pesquisa

A utilização de uma camada de cache Redis reduz a latência de recuperação de metadados em um catálogo de filmes multimídia sob demanda baseado em PostgreSQL?

### 3.2. Hipótese

A utilização de Redis como camada de cache entre a aplicação Next.js e o PostgreSQL reduz o tempo de resposta das consultas recorrentes de metadados, especialmente quando os resultados já estão armazenados no cache.

---

## 4. Objetivos

### 4.1. Objetivo geral

Avaliar experimentalmente o impacto da utilização de Redis no desempenho da recuperação de metadados em um sistema de informação multimídia sob demanda.

### 4.2. Objetivos específicos

* Implementar uma camada de cache Redis integrada ao catálogo de filmes.
* Definir cenários experimentais com e sem utilização de cache.
* Selecionar diferentes operações de recuperação de informações do catálogo.
* Medir a latência das requisições em cada cenário.
* Avaliar o comportamento do sistema sob diferentes níveis de concorrência.
* Comparar os resultados obtidos nas duas arquiteturas.
* Identificar as operações que apresentam maior benefício com a utilização de cache.

---

## 5. Fundamentação da proposta

A pesquisa está relacionada aos seguintes conceitos:

### 5.1. Sistemas de informação multimídia sob demanda

São sistemas que disponibilizam conteúdo multimídia conforme a solicitação dos usuários.

No contexto deste trabalho, o catálogo de filmes permite recuperar informações sobre obras cinematográficas e disponibilizar referências para conteúdos como trailers.

### 5.2. Metadados multimídia

Metadados são informações utilizadas para descrever, identificar, classificar e recuperar conteúdos.

No catálogo desenvolvido, os metadados incluem:

* Título e título original.
* Sinopse.
* Gêneros.
* Data de lançamento.
* Nota média.
* Elenco.
* Informações de coleção.
* Referências para trailers.
* Caminhos para imagens e pôsteres.

Esses dados estão distribuídos entre diferentes entidades do PostgreSQL.

### 5.3. Cache

Cache é um mecanismo de armazenamento temporário que permite reutilizar informações previamente recuperadas.

Neste experimento, Redis será utilizado para armazenar os resultados de consultas realizadas ao PostgreSQL.

Quando uma requisição for recebida, a aplicação verificará inicialmente a existência dos dados no cache.

Caso os dados estejam disponíveis, serão retornados diretamente do Redis.

Caso contrário, a aplicação realizará a consulta ao PostgreSQL, armazenará o resultado no Redis e retornará os dados ao usuário.

### 5.4. Latência

Latência representa o tempo necessário para que uma operação seja concluída.

No experimento, será utilizada como uma das principais métricas para avaliar o desempenho da recuperação de metadados.

---

## 6. Arquitetura do sistema

### 6.1. Arquitetura atual

A arquitetura atual do catálogo utiliza Next.js para disponibilizar as informações armazenadas no PostgreSQL.

```text
                 Usuário
                    |
                    v
                  Next.js
                    |
                    v
                PostgreSQL
                    |
                    v
             Dados do catálogo
                    |
                    v
                  Next.js
                    |
                    v
                  Usuário
```

Os dados do catálogo foram previamente extraídos do TMDB e armazenados no PostgreSQL por meio de um processo de seed.

Dessa forma, a recuperação das informações dos filmes ocorre a partir do banco de dados próprio, sem necessidade de consultar o TMDB a cada requisição.

### 6.2. Arquitetura proposta

A arquitetura experimental adicionará Redis entre a aplicação Next.js e o PostgreSQL.

```text
                  Usuário
                     |
                     v
                   Next.js
                     |
                     v
                   Redis
                  /     \
                 /       \
            Cache HIT   Cache MISS
               |            |
               |            v
               |        PostgreSQL
               |            |
               |            v
               |        Armazenamento
               |        no Redis
               |            |
               +------------+
                     |
                     v
                   Next.js
                     |
                     v
                   Usuário
```

A aplicação será responsável por verificar a existência dos dados no Redis e realizar a consulta ao PostgreSQL quando necessário.

O Redis será utilizado como uma camada de cache, enquanto o PostgreSQL continuará sendo a fonte principal dos dados.

---

## 7. Metodologia

A pesquisa será conduzida por meio de um experimento quantitativo e comparativo.

Será utilizado o catálogo de filmes previamente desenvolvido, adicionando-se uma camada de cache Redis à arquitetura existente.

O experimento será dividido em duas configurações.

### 7.1. Cenário A — PostgreSQL sem Redis

Neste cenário, as requisições serão atendidas diretamente pelo PostgreSQL.

A aplicação executará as consultas necessárias para recuperar os metadados dos filmes.

```text
Next.js → PostgreSQL → Next.js
```

Esse cenário representará a arquitetura de referência.

### 7.2. Cenário B — PostgreSQL com Redis

Neste cenário, a aplicação verificará inicialmente se os dados estão armazenados no Redis.

Em caso de acerto de cache, os dados serão retornados diretamente.

Em caso de ausência dos dados, será realizada uma consulta ao PostgreSQL.

```text
Next.js → Redis → PostgreSQL
```

O resultado da consulta será armazenado no Redis para permitir sua reutilização em requisições posteriores.

### 7.3. Cenários de recuperação

Serão avaliadas diferentes operações disponíveis no catálogo.

| Identificador | Operação                            | Característica                             |
| ------------- | ----------------------------------- | ------------------------------------------ |
| C1            | Recuperação de detalhes de um filme | Consulta individual                        |
| C2            | Recuperação de filme com elenco     | Consulta com relacionamentos               |
| C3            | Recuperação de filmes por gênero    | Consulta com múltiplos resultados          |
| C4            | Recuperação de filmes de uma lista  | Consulta de conteúdo associado a uma lista |

As operações serão selecionadas de acordo com as funcionalidades efetivamente implementadas no catálogo.

### 7.4. Preparação dos dados

Será utilizado o conjunto de dados já armazenado no PostgreSQL.

Antes dos experimentos, serão identificadas as consultas utilizadas pela aplicação para recuperar os metadados.

Os mesmos dados e operações serão utilizados nos dois cenários, de modo a permitir uma comparação consistente.

### 7.5. Execução dos testes

Para cada operação selecionada:

1. Executar a consulta no cenário sem Redis.
2. Registrar o tempo de resposta.
3. Repetir o procedimento para obter uma amostra de resultados.
4. Executar a mesma operação no cenário com Redis.
5. Realizar requisições com cache inicialmente vazio.
6. Realizar requisições com cache previamente preenchido.
7. Registrar os resultados.
8. Comparar as métricas obtidas.

A quantidade de repetições e os níveis de concorrência serão definidos antes da execução dos experimentos.

---

## 8. Métricas de avaliação

Serão utilizadas métricas para avaliar o desempenho da recuperação de informações e o comportamento do mecanismo de cache.

### 8.1. Latência média

Representa o tempo médio necessário para atender às requisições.

$$
L_{media} = \frac{1}{N}\sum_{i=1}^{N}L_i
$$

Onde:

* \(N\): quantidade de requisições.
* \(L_i\): latência da requisição \(i\).

### 8.2. Mediana da latência

Representa o valor central das latências observadas.

A mediana será utilizada para reduzir a influência de requisições excepcionalmente lentas.

### 8.3. Percentil 95 (P95)

Representa o valor abaixo do qual se encontram 95% das latências observadas.

Essa métrica permitirá avaliar o comportamento das requisições mais lentas.

### 8.4. Throughput

Representa a quantidade de requisições atendidas por unidade de tempo.

$$
Throughput = \frac{N}{T}
$$

Onde:

* \(N\): quantidade de requisições concluídas.
* \(T\): duração do experimento.

### 8.5. Taxa de acerto do cache

Representa a proporção de requisições atendidas diretamente pelo Redis.

$$
HitRate(\%) =
\frac{CacheHits}{CacheHits + CacheMisses}
\times 100
$$

### 8.6. Redução percentual da latência

Será utilizada para comparar o desempenho dos dois cenários.

$$
Reducao(\%) =
\frac{L_{PostgreSQL}-L_{Redis}}
{L_{PostgreSQL}}
\times 100
$$

Onde:

* \(L_{PostgreSQL}\): latência média do cenário sem Redis.
* \(L_{Redis}\): latência média do cenário com Redis.

---

## 9. Ferramentas e tecnologias

| Tecnologia                | Utilização                            |
| ------------------------- | ------------------------------------- |
| Next.js                   | Aplicação do catálogo                 |
| PostgreSQL                | Banco de dados principal              |
| Redis                     | Camada de cache                       |
| Upstash Redis             | Serviço Redis gerenciado              |
| Vercel                    | Hospedagem da aplicação               |
| k6                        | Geração de carga e coleta de métricas |
| The Movie Database (TMDB) | Fonte original dos dados do catálogo  |

O Redis será integrado à aplicação por meio da biblioteca `@upstash/redis`.

O k6 será utilizado para gerar requisições HTTP ao catálogo e avaliar seu comportamento sob diferentes níveis de carga.

---

## 10. Resultados esperados

Espera-se que a utilização de Redis reduza a latência das requisições recorrentes, principalmente nas operações cujos resultados podem ser armazenados e reutilizados.

Também se espera observar uma redução na quantidade de consultas realizadas ao PostgreSQL.

Entretanto, o impacto do cache poderá variar conforme a operação executada.

Consultas simples, que já apresentam baixo tempo de resposta, podem apresentar ganhos menores.

Consultas com múltiplos relacionamentos ou que retornam conjuntos maiores de dados podem apresentar comportamentos diferentes.

Os resultados serão analisados considerando as limitações da infraestrutura e as condições de execução dos experimentos.

### 10.1. Tabela para registro dos resultados

Os valores serão preenchidos após a execução dos experimentos.

| Operação | Cenário    | Latência média | Mediana | P95 | Throughput |
| -------- | ---------- | -------------: | ------: | --: | ---------: |
| C1       | PostgreSQL |              — |       — |   — |          — |
| C1       | Redis      |              — |       — |   — |          — |
| C2       | PostgreSQL |              — |       — |   — |          — |
| C2       | Redis      |              — |       — |   — |          — |
| C3       | PostgreSQL |              — |       — |   — |          — |
| C3       | Redis      |              — |       — |   — |          — |
| C4       | PostgreSQL |              — |       — |   — |          — |
| C4       | Redis      |              — |       — |   — |          — |

---

## 11. Discussão

A análise dos resultados buscará responder à pergunta de pesquisa.

Serão investigados os seguintes aspectos:

* O Redis reduziu a latência média das operações?
* O ganho foi semelhante para todas as consultas?
* O cache apresentou maior benefício nas operações com relacionamentos?
* O desempenho variou conforme o nível de concorrência?
* A taxa de acerto do cache influenciou os resultados?
* O uso de Redis introduziu algum custo adicional?

A discussão deverá considerar que a latência observada não depende exclusivamente do banco de dados.

A comunicação entre a aplicação hospedada na Vercel, o Redis e o PostgreSQL também pode influenciar os resultados.

Além disso, mecanismos de cache da própria aplicação ou da infraestrutura de hospedagem deverão ser considerados para evitar atribuições incorretas de desempenho.

---

## 12. Limitações

A pesquisa será realizada em um catálogo específico de filmes, utilizando um conjunto de dados previamente extraído do TMDB.

Dessa forma, os resultados não poderão ser generalizados automaticamente para todos os sistemas multimídia sob demanda.

Outras limitações incluem:

* Dependência das condições da infraestrutura de hospedagem.
* Variação da latência de comunicação entre serviços.
* Possível influência de caches existentes na aplicação.
* Dependência da distribuição das consultas utilizadas nos testes.
* Necessidade de considerar a expiração e a atualização dos dados armazenados no Redis.

---

## 13. Conclusão

O experimento proposto permitirá avaliar o impacto da utilização de Redis na recuperação de metadados em um sistema de informação multimídia sob demanda.

A comparação entre as arquiteturas com e sem cache permitirá identificar possíveis melhorias de desempenho e compreender como diferentes operações do catálogo se comportam diante da utilização de uma camada de armazenamento temporário.

A pesquisa utilizará uma implementação funcional como objeto de estudo, relacionando os conceitos de sistemas multimídia sob demanda, recuperação de informações, cache e desempenho de aplicações distribuídas.

A conclusão será baseada nos resultados experimentais efetivamente obtidos, buscando responder à pergunta de pesquisa e identificar possíveis trabalhos futuros.

---

## 14. Trabalhos futuros

Como continuidade da pesquisa, poderão ser investigadas:

* Estratégias de expiração e invalidação de cache.
* Comparação entre diferentes políticas de cache.
* Avaliação de outros mecanismos de armazenamento.
* Impacto do cache em diferentes níveis de concorrência.
* Avaliação do desempenho em diferentes regiões de hospedagem.
* Estratégias de personalização e recomendação de conteúdo.
* Impacto da recuperação de metadados na experiência do usuário.
