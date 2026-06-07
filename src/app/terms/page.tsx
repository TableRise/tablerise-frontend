import '@/app/terms/page.css';

const termsSections = [
    {
        title: '1. Aceitacao dos Termos',
        paragraphs: [
            'Ao acessar ou utilizar a plataforma TableRise, voce concorda com estes Termos de Uso. Caso nao concorde com qualquer disposicao deste documento, voce nao deve utilizar a plataforma.',
            'Estes Termos se aplicam a visitantes, usuários cadastrados, mestres, jogadores e quaisquer outras pessoas que utilizem os recursos disponibilizados pelo TableRise.',
        ],
    },
    {
        title: '2. Cadastro e Conta do usuário',
        paragraphs: [
            'Para acessar determinadas funcionalidades, pode ser necessario criar uma conta. Voce se compromete a fornecer informacoes verdadeiras, completas e atualizadas durante o cadastro e ao longo do uso da plataforma.',
            'Voce e responsavel por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Caso identifique uso nao autorizado, voce deve nos avisar o quanto antes.',
        ],
    },
    {
        title: '3. Uso Permitido da Plataforma',
        paragraphs: [
            'O TableRise pode ser utilizado para criar, organizar e participar de campanhas, personagens, anotacoes, midias e demais recursos relacionados a RPG de mesa.',
            'Voce concorda em utilizar a plataforma de forma licita, etica e em conformidade com a legislacao aplicavel, sem praticar atos que prejudiquem outros usuários, a plataforma ou terceiros.',
        ],
        bullets: [
            'publicar conteudo ilegal, ofensivo, discriminatorio, violento ou que viole direitos de terceiros;',
            'tentar acessar areas, contas, sistemas ou dados sem autorizacao;',
            'utilizar a plataforma para disseminar malware, spam, fraudes ou qualquer atividade abusiva;',
            'interferir no funcionamento, seguranca ou disponibilidade dos servicos.',
        ],
    },
    {
        title: '4. Conteudo do usuário',
        paragraphs: [
            'O usuário permanece titular do conteudo que criar ou enviar para a plataforma, incluindo textos, imagens, fichas, campanhas e outros materiais.',
            'Ao publicar conteudo no TableRise, voce declara que possui os direitos necessarios para utiliza-lo e nos concede uma licenca nao exclusiva para hospedar, armazenar, processar e exibir esse conteudo apenas na medida necessaria para operar a plataforma.',
        ],
    },
    {
        title: '5. Propriedade Intelectual',
        paragraphs: [
            'A identidade visual, o software, a estrutura da plataforma, os textos institucionais, marcas, logotipos e demais elementos do TableRise pertencem aos seus respectivos titulares e sao protegidos pela legislacao aplicavel.',
            'Nao e permitido copiar, reproduzir, modificar, distribuir ou explorar comercialmente qualquer parte da plataforma sem autorizacao previa, exceto quando expressamente permitido por lei.',
        ],
    },
    {
        title: '6. Privacidade e Tratamento de Dados',
        paragraphs: [
            'O tratamento de dados pessoais realizado pelo TableRise segue nossa Politica de Privacidade e a legislacao aplicavel. Ao utilizar a plataforma, voce reconhece que determinados dados podem ser tratados para viabilizar autenticacao, suporte, seguranca, comunicacoes e funcionamento dos servicos.',
        ],
    },
    {
        title: '7. Disponibilidade e Alteracoes da Plataforma',
        paragraphs: [
            'Empenhamos esforcos razoaveis para manter a plataforma disponivel, mas nao garantimos funcionamento continuo, sem interrupcoes ou livre de erros.',
            'O TableRise pode alterar, suspender ou descontinuar funcionalidades, conteudos, integracoes ou partes da plataforma a qualquer momento, com ou sem aviso previo, especialmente por razoes tecnicas, operacionais, legais ou de seguranca.',
        ],
    },
    {
        title: '8. Suspensao e Encerramento',
        paragraphs: [
            'Podemos suspender ou encerrar contas, limitar acessos ou remover conteudos que violem estes Termos, a legislacao aplicavel ou a seguranca da plataforma e de seus usuários.',
            'Voce tambem pode deixar de utilizar a plataforma a qualquer momento. O encerramento da conta nao elimina obrigacoes anteriores nem responsabilidades decorrentes de uso indevido.',
        ],
    },
    {
        title: '9. Limitacao de Responsabilidade',
        paragraphs: [
            'Na maxima extensao permitida pela lei, o TableRise nao se responsabiliza por danos indiretos, lucros cessantes, perda de dados, indisponibilidade temporaria, falhas causadas por terceiros ou por conteudos inseridos pelos usuários.',
            'Nada nestes Termos exclui responsabilidades que nao possam ser limitadas ou afastadas por lei.',
        ],
    },
    {
        title: '10. Alteracoes destes Termos',
        paragraphs: [
            'Estes Termos podem ser atualizados periodicamente para refletir mudancas legais, tecnicas ou operacionais. Quando isso ocorrer, a versao atualizada passara a valer a partir de sua publicacao na plataforma.',
            'Recomendamos que voce revise esta pagina regularmente para acompanhar eventuais alteracoes.',
        ],
    },
    {
        title: '11. Contato',
        paragraphs: [
            'Em caso de duvidas sobre estes Termos de Uso, entre em contato pelos canais oficiais disponibilizados pelo TableRise na pagina de suporte.',
        ],
    },
];

export default function TermsPage(): JSX.Element {
    return (
        <main className="terms-page">
            <section className="terms-inside-container">
                <div className="terms-hero">
                    <p className="font-XS-bold terms-eyebrow">Termos de Uso</p>
                    <h1 className="font-XL-bold terms-title">
                        Regras gerais para uso da plataforma TableRise
                    </h1>
                    <p className="font-S-regular terms-lead">
                        Ultima atualizacao: 17 de maio de 2026. Este texto serve como
                        modelo padrao para orientar o uso da plataforma por jogadores,
                        mestres e visitantes.
                    </p>
                </div>

                <section className="terms-card">
                    <div className="terms-note">
                        <p className="font-XS-bold terms-note-title">Aviso importante</p>
                        <p className="font-S-regular terms-note-text">
                            Este conteudo foi elaborado como texto padrao inicial e pode
                            ser ajustado conforme a operacao real do produto e a
                            orientacao juridica da equipe responsavel.
                        </p>
                    </div>

                    <div className="terms-sections">
                        {termsSections.map((section) => (
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
