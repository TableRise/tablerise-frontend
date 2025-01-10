const chalk = require('chalk');
const { execSync } = require('child_process');

// Obter o nome da branch
const BRANCH = execSync('git symbolic-ref --short HEAD').toString().trim();

// Regex corrigido
const REGEX = '/^(feat|bugfix|hotfix)\\/([a-zA-Z0-9-]+)\\/([a-zA-Z0-9-]+)$/';

const handlePrettierError = () => {
    console.log(chalk.yellow('⚠️  Corrigindo o Prettier...'));
    execSync('npm run prettier:fix', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    // Usando o comando de commit corretamente
    execSync('git commit -m "fix: prettier"', { stdio: 'inherit' });
    execSync('git push -u origin ' + BRANCH, { stdio: 'inherit' });
    console.log(chalk.green('✅ Prettier corrigido e alterações enviadas.'));
};

const trap = (callback) => {
    process.on('uncaughtException', callback);
    process.on('unhandledRejection', callback);
};

trap(() => handlePrettierError());

// Exibição do título do hook
console.log(
    chalk.green(
        '=============================\n||   TableRise Push Hook   ||\n============================='
    )
);
console.log(chalk.blue('🔍 Executando lint...'));
execSync('npm run lint', { stdio: 'inherit' });
console.log(chalk.blue('🔍 Executando prettier...'));
execSync('npm run prettier', { stdio: 'inherit' });

// Verificação do nome da branch
if (!REGEX.test(BRANCH)) {
    console.log(chalk.red('========================'));
    console.log('');
    console.log(chalk.red('❌ Seu push foi rejeitado devido ao nome da branch'));
    console.log('');
    console.log(chalk.blue('💡 Por favor, renomeie sua branch utilizando a sintaxe:'));
    console.log(chalk.green('(feat|bugfix|hotfix)/task-id/branch-objective'));
    console.log(
        chalk.red('🚫 Pushes nas branches develop, main ou qa não são permitidos.')
    );
    console.log('');
    console.log(chalk.red('========================'));
    process.exit(1);
}

// Sucesso
console.log(chalk.green('✅ Tudo certo! Push permitido.'));
