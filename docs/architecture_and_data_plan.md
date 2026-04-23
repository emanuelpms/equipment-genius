# Plano de Arquitetura e Estrutura de Dados para o Sistema Equipment Genius

## 1. Introdução

Este documento detalha o plano de arquitetura e estrutura de dados para integrar a funcionalidade de comparação de equipamentos médicos, conforme o formato Excel fornecido, ao sistema `equipment-genius`. O objetivo é garantir que todos os dados presentes na planilha Excel possam ser representados, armazenados e exibidos de forma eficaz na aplicação web.

## 2. Análise da Estrutura Existente

O repositório `equipment-genius` já possui uma estrutura bem definida utilizando React, TanStack Router, Zustand para gerenciamento de estado e TailwindCSS para estilização. Os arquivos `src/lib/store.ts` e `src/routes/showcase.compare.tsx` são particularmente relevantes para a funcionalidade de comparação.

### 2.1. `src/lib/store.ts`

Este arquivo define as interfaces principais do sistema, que são fundamentais para a representação dos dados:

*   **`SpecField`**: Define as especificações técnicas dos equipamentos, incluindo `id`, `key`, `label`, `type` (text, number, boolean, select), `unit`, `group`, `highlight` e `order`. Esta interface é crucial para mapear as linhas da planilha Excel.
*   **`Category`**: Utilizada para categorizar os equipamentos (ex: Cardiologia, Radiologia).
*   **`Differential`**: Representa diferenciais ou características únicas dos equipamentos.
*   **`Brand`**: Define as marcas dos equipamentos.
*   **`Equipment`**: A entidade central que representa um equipamento, contendo `id`, `name`, `shortName`, `brandId`, `tier`, `tagline`, `description`, `imageUrl`, `photos`, `categories`, `bestFor`, `differentials` e, mais importante, `specs` (um `Record<string, string | number | boolean>`) para armazenar os valores das `SpecField`.

### 2.2. `src/routes/showcase.compare.tsx`

Esta rota é responsável por renderizar a tabela de comparação. Ela utiliza os dados do `useStore()` (definido em `store.ts`) para buscar equipamentos, campos de especificação e marcas. A lógica de `computeScores` demonstra a capacidade de processar e comparar os valores das especificações.

## 3. Mapeamento da Planilha Excel para a Estrutura de Dados Existente

A planilha Excel fornecida apresenta uma estrutura de comparação onde as colunas representam equipamentos (agrupados por marca) e as linhas representam especificações técnicas (agrupadas por categorias como Hardware e Radiologia).

### 3.1. Marcas e Equipamentos

*   **Marcas**: As marcas (SAMSUNG, GE, Mindray, BARD, BD, Fujifilm, Esaote) serão mapeadas para a interface `Brand`.
*   **Equipamentos**: Cada equipamento (Meerkat, Venue Go, Venue Fit, TE7, TE9, TEX20, V5, Site-Rite 8, SII, MyLab X1) será mapeado para a interface `Equipment`. O `brandId` vinculará o equipamento à sua respectiva marca. O `imageUrl` ou `photos` será usado para a imagem do equipamento.

### 3.2. Especificações Técnicas (`SpecField`)

As linhas da planilha Excel correspondem diretamente aos `SpecField`s. A coluna 'Marca' e 'Equipamento' são atributos do `Equipment`. A linha 'Imagem' é o `imageUrl` do `Equipment`. As demais linhas serão mapeadas da seguinte forma:

| Categoria Excel | Campo Excel               | `SpecField.key` (sugestão) | `SpecField.label`           | `SpecField.type` | `SpecField.unit` | `SpecField.group` |
| :-------------- | :------------------------ | :------------------------- | :-------------------------- | :--------------- | :--------------- | :---------------- |
| Hardware        | Média de preço            | `price`                    | Média de preço              | `text`           | BRL              | Hardware          |
| Hardware        | Canais                    | `channels`                 | Canais                      | `number`         |                  | Hardware          |
| Hardware        | Sistema operacional       | `os`                       | Sistema operacional         | `text`           |                  | Hardware          |
| Hardware        | Wifi                      | `wifi`                     | Wi-Fi                       | `boolean`        |                  | Hardware          |
| Hardware        | Tipo de Monitor           | `monitorType`              | Tipo de Monitor             | `text`           |                  | Hardware          |
| Hardware        | Tamanho do Monitor        | `monitorSize`              | Tamanho do Monitor          | `number`         | pol              | Hardware          |
| Hardware        | Tela Touch                | `touchScreen`              | Tela Touch                  | `boolean`        |                  | Hardware          |
| Hardware        | Armazenamento             | `storage`                  | Armazenamento               | `text`           |                  | Hardware          |
| Hardware        | Portas Ativas             | `activePorts`              | Portas Ativas               | `number`         |                  | Hardware          |
| Hardware        | Portas USB                | `usbPorts`                 | Portas USB                  | `number`         |                  | Hardware          |
| Hardware        | Peso                      | `weight`                   | Peso                        | `number`         | kg               | Hardware          |
| Hardware        | Dimensões (AxLxP)         | `dimensions`               | Dimensões (AxLxP)           | `text`           |                  | Hardware          |
| Hardware        | Ajuste de altura          | `heightAdjust`             | Ajuste de altura            | `boolean`        |                  | Hardware          |
| Hardware        | Braço articulado          | `articulatedArm`           | Braço articulado            | `boolean`        |                  | Hardware          |
| Hardware        | Aquecedor de gel          | `gelWarmer`                | Aquecedor de gel            | `boolean`        |                  | Hardware          |
| Hardware        | Possibilidade de Pedal    | `pedalOption`              | Possibilidade de Pedal      | `boolean`        |                  | Hardware          |
| Hardware        | Tipo de teclado (Virtual/Físico) | `keyboardType`             | Tipo de teclado             | `select`         |                  | Hardware          |
| Hardware        | Bateria                   | `battery`                  | Bateria                     | `boolean`        |                  | Hardware          |
| Hardware        | Suporte para transdutores | `transducerHolders`        | Suporte para transdutores   | `number`         |                  | Hardware          |
| Radiologia      | Medidas automáticas?      | `radAutoMeas`              | Medidas automáticas?        | `boolean`        |                  | Radiologia        |
| Radiologia      | Recursos de IA            | `radAI`                    | Recursos de IA              | `boolean`        |                  | Radiologia        |
| Radiologia      | Share Wave no Convexo     | `swConvex`                 | Share Wave no Convexo       | `boolean`        |                  | Radiologia        |
| Radiologia      | Share Wave no Linear      | `swLinear`                 | Share Wave no Linear        | `boolean`        |                  | Radiologia        |
| Radiologia      | Contraste por Microbolhas | `ceus`                     | Contraste por Microbolhas   | `boolean`        |                  | Radiologia        |
| Radiologia      | Single Cristal            | `singleCrystal`            | Single Cristal              | `boolean`        |                  | Radiologia        |
| Radiologia      | Maior Frequencia          | `maxFreq`                  | Maior Frequencia            | `number`         | MHz              | Radiologia        |

*Nota: Os `SpecField.key`s sugeridos são baseados nos `F` constantes já existentes em `store.ts` para consistência. Alguns campos podem já existir ou ter nomes ligeiramente diferentes, mas o mapeamento será ajustado durante a implementação.* 

## 4. Identificação de Componentes Faltantes e Ajustes Necessários

Com base na análise, a estrutura de dados existente em `store.ts` e a funcionalidade de comparação em `showcase.compare.tsx` já fornecem uma base sólida para replicar o formato Excel. No entanto, alguns ajustes e considerações são importantes:

*   **Preenchimento de Dados**: Será necessário popular o `store.ts` com os dados dos equipamentos da planilha Excel. Isso pode ser feito manualmente através da interface administrativa (`admin.equipments.tsx`) ou, idealmente, através de uma função de importação de dados (que já existe em `store.ts` via `importCatalog`).
*   **UI/UX da Tabela de Comparação**: A `showcase.compare.tsx` já exibe uma tabela de comparação. Será preciso garantir que a renderização dos `SpecField`s seja flexível o suficiente para acomodar todos os tipos de dados (texto, número, booleano, select) e que a organização por `group` (Hardware, Radiologia, etc.) seja clara e intuitiva, replicando a estrutura visual do Excel.
*   **Imagens na Tabela**: A planilha Excel mostra imagens dos equipamentos. A `showcase.compare.tsx` já exibe imagens nos 
cartões de equipamento. Será necessário garantir que essas imagens sejam visíveis e bem integradas na visualização da tabela de comparação, talvez como uma linha dedicada ou dentro do cabeçalho de cada coluna de equipamento.
*   **Interatividade**: A planilha Excel é estática. O sistema web deve oferecer interatividade, como a capacidade de adicionar/remover equipamentos da comparação, filtrar por marcas/categorias e talvez até ordenar por especificações.
*   **Responsividade**: Conforme os requisitos do usuário, a interface deve ser totalmente adaptada para dispositivos móveis.
*   **Animações**: O usuário também solicitou animações para melhorar a experiência do usuário.

## 5. Próximos Passos

1.  **Validação do Mapeamento**: Confirmar se o mapeamento proposto para `SpecField`s é abrangente e preciso para todos os dados da planilha Excel.
2.  **População de Dados**: Desenvolver ou utilizar a funcionalidade de importação para popular o sistema com os dados iniciais dos equipamentos, marcas e especificações.
3.  **Desenvolvimento Frontend**: Ajustar e aprimorar a interface de comparação (`showcase.compare.tsx`) para exibir os dados de forma clara, responsiva e com as animações solicitadas, replicando a estética e funcionalidade da planilha Excel.
4.  **Testes**: Realizar testes extensivos para garantir a funcionalidade, precisão dos dados e responsividade em diferentes dispositivos.

## 6. Conclusão

A base do sistema `equipment-genius` é robusta e já prevê grande parte da estrutura necessária para a funcionalidade de comparação. O desafio principal será a importação e organização dos dados da planilha Excel, bem como o refinamento da interface do usuário para replicar e aprimorar a experiência de comparação visualmente apresentada.
