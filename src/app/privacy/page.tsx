import '@/app/terms/page.css';

const privacySections = [
    {
        title: '1. Introdução',
        paragraphs: [
            'Esta Politica de Privacidade explica como o TableRise coleta, utiliza, armazena e protege informacoes pessoais e tecnicas relacionadas ao uso da plataforma.',
            'Ao acessar ou utilizar o TableRise, voce reconhece esta politica como referencia para o tratamento de dados necessario ao funcionamento do produto.',
        ],
    },
    {
        title: '2. Dados que podemos coletar',
        paragraphs: [
            'Podemos coletar dados fornecidos diretamente por voce, como nickname, email, imagem de perfil, conteudos criados na plataforma e informacoes enviadas em formularios de suporte.',
            'Tambem podemos tratar dados tecnicos e operacionais, como identificadores de sessao, registros basicos de acesso, preferencias locais e informacoes necessarias para autenticação, seguranca e funcionamento da conta.',
        ],
        bullets: [
            'dados de cadastro e autenticação;',
            'informacoes de perfil, personagens, campanhas, imagens e outros conteudos criados por voce;',
            'dados enviados em contatos, feedbacks ou chamados de suporte;',
            'dados tecnicos indispensaveis para estabilidade, seguranca e prevenção de abuso.',
        ],
    },
    {
        title: '3. Como usamos os dados',
        paragraphs: [
            'Os dados tratados pelo TableRise são utilizados para permitir o acesso a conta, disponibilizar funcionalidades da plataforma, manter campanhas e personagens, responder solicitacoes de suporte e proteger a integridade do servico.',
            'Tambem podemos utilizar informacoes para diagnostico tecnico, melhoria de experiencia, correção de erros, prevenção de fraude e cumprimento de obrigacoes legais.',
        ],
    },
    {
        title: '4. Compartilhamento de dados',
        paragraphs: [
            'O TableRise não comercializa dados pessoais. O compartilhamento pode ocorrer apenas quando necessario para operação tecnica da plataforma, cumprimento de obrigacoes legais, investigação de incidentes de seguranca ou proteção de direitos do TableRise e de terceiros.',
            'Quando houver integracoes, provedores de infraestrutura ou ferramentas de autenticação, o tratamento de dados sera limitado ao necessario para prestar o servico correspondente.',
        ],
    },
    {
        title: '5. Armazenamento e seguranca',
        paragraphs: [
            'Adotamos medidas razoaveis para proteger os dados tratados contra acesso não autorizado, alteração indevida, perda acidental ou uso abusivo.',
            'Apesar desses cuidados, nenhum ambiente digital pode garantir seguranca absoluta. Por isso, voce tambem deve manter suas credenciais protegidas e comunicar rapidamente qualquer suspeita de uso indevido.',
        ],
    },
    {
        title: '6. Base legal e retenção',
        paragraphs: [
            'Os dados podem ser tratados com fundamento em execução do servico solicitado por voce, cumprimento de obrigacoes legais, exercicio regular de direitos e interesses legitimos relacionados a seguranca, estabilidade e evolução da plataforma.',
            'As informacoes são mantidas pelo tempo necessario para cumprir essas finalidades, respeitar exigencias legais, resolver disputas e preservar a continuidade operacional do TableRise.',
        ],
    },
    {
        title: '7. Direitos do titular',
        paragraphs: [
            'Conforme a legislação aplicavel, voce pode solicitar confirmação de tratamento, acesso, correção, atualização, eliminação quando cabivel e esclarecimentos sobre o uso de seus dados.',
            'Solicitacoes relacionadas a privacidade podem ser encaminhadas pelos canais oficiais disponibilizados pelo TableRise na pagina de suporte.',
        ],
    },
    {
        title: '8. Cookies e tecnologias semelhantes',
        paragraphs: [
            'O TableRise pode utilizar cookies, armazenamento local e recursos semelhantes para manter sessoes autenticadas, lembrar preferencias, melhorar usabilidade e viabilizar fluxos essenciais da plataforma.',
            'Alguns desses recursos são estritamente necessarios para o funcionamento do produto e podem permanecer ativos enquanto voce utiliza a plataforma.',
        ],
    },
    {
        title: '9. Alteracoes desta politica',
        paragraphs: [
            'Esta Politica de Privacidade pode ser atualizada periodicamente para refletir mudancas tecnicas, operacionais ou legais.',
            'Quando isso ocorrer, a versao publicada nesta pagina passara a valer como referencia atual para o tratamento de dados no TableRise.',
        ],
    },
    {
        title: '10. Contato',
        paragraphs: [
            'Em caso de duvidas sobre esta Politica de Privacidade ou sobre o tratamento de dados relacionado ao TableRise, utilize os canais oficiais informados na pagina de suporte.',
        ],
    },
];

export default function PrivacyPage(): JSX.Element {
    return (
        <main className="terms-page">
            <section className="terms-inside-container">
                <div className="terms-hero">
                    <p className="font-XS-bold terms-eyebrow">Politica de Privacidade</p>
                    <h1 className="font-XL-bold terms-title">
                        Como o TableRise trata dados e protege a experiencia na plataforma
                    </h1>
                    <p className="font-S-regular terms-lead">
                        Ultima atualização: 9 de junho de 2026. Este texto serve como
                        modelo padrao inicial para orientar transparencia, tratamento de
                        dados e boas praticas de privacidade no produto.
                    </p>
                </div>

                <section className="terms-card">
                    <div className="terms-note">
                        <p className="font-XS-bold terms-note-title">Aviso importante</p>
                        <p className="font-S-regular terms-note-text">
                            Este conteudo foi elaborado como texto padrao inicial e pode
                            ser ajustado conforme a operação real do produto e a
                            orientação juridica da equipe responsavel.
                        </p>
                    </div>

                    <div className="terms-sections">
                        {privacySections.map((section) => (
                            <article key={section.title} className="terms-section">
                                <h2 className="font-M-semibold terms-section-title">
                                    {section.title}
                                </h2>

                                {section.paragraphs.map((paragraph) => (
                                    <p
                                        key={`${section.title}-${paragraph.slice(0, 24)}`}
                                        className="font-S-regular terms-section-text"
                                    >
                                        {paragraph}
                                    </p>
                                ))}

                                {section.bullets ? (
                                    <ul className="terms-section-list">
                                        {section.bullets.map((bullet) => (
                                            <li
                                                key={`${section.title}-${bullet.slice(
                                                    0,
                                                    24
                                                )}`}
                                                className="font-S-regular terms-section-list-item"
                                            >
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </article>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}
