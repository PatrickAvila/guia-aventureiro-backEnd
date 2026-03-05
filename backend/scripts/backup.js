/**
 * Backup Script - Faz backup do banco de dados MongoDB
 * Uso: node backend/scripts/backup.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Gera nome do arquivo de backup
 */
const generateBackupFilename = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0];
  return `backup_${timestamp}`;
};

/**
 * Cria diretório de backups se não existir
 */
const ensureBackupDir = () => {
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Diretório de backups criado');
  }
  return backupDir;
};

/**
 * Executa mongodump
 */
const runMongoDump = (backupDir, backupName) => {
  return new Promise((resolve, reject) => {
    const mongoUri = process.env.MONGO_URI;
    const outputPath = path.join(backupDir, backupName);

    // Comando mongodump
    const command = `mongodump --uri="${mongoUri}" --out="${outputPath}"`;

    console.log(`🚀 Iniciando backup: ${backupName}`);
    console.log('⏳ Aguarde...\n');

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro ao executar mongodump:', error.message);
        reject(error);
        return;
      }

      if (stderr) {
        console.error('stderr:', stderr);
      }

      console.log(stdout);
      resolve(outputPath);
    });
  });
};

/**
 * Compacta backup (opcional)
 */
const compressBackup = (backupPath) => {
  return new Promise((resolve, reject) => {
    const zipPath = `${backupPath}.zip`;
    const command = `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${zipPath}"`;

    console.log('📦 Compactando backup...');

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('⚠️  Erro ao compactar (não é crítico):', error.message);
        resolve(backupPath); // Continua mesmo se falhar a compactação
        return;
      }

      console.log(`✅ Backup compactado: ${zipPath}`);

      // Remove pasta não compactada
      exec(`rmdir /s /q "${backupPath}"`, () => {
        resolve(zipPath);
      });
    });
  });
};

/**
 * Lista backups existentes
 */
const listBackups = (backupDir) => {
  const files = fs.readdirSync(backupDir);
  const backups = files.filter(file => file.startsWith('backup_'));

  if (backups.length > 0) {
    console.log('\n📋 Backups existentes:');
    backups.forEach((backup, index) => {
      const stats = fs.statSync(path.join(backupDir, backup));
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ${index + 1}. ${backup} (${sizeMB} MB)`);
    });
  }
};

/**
 * Remove backups antigos (mantém últimos 5)
 */
const cleanOldBackups = (backupDir, keepLast = 5) => {
  const files = fs.readdirSync(backupDir);
  const backups = files
    .filter(file => file.startsWith('backup_'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time); // Mais recente primeiro

  if (backups.length > keepLast) {
    console.log(`\n🗑️  Removendo backups antigos (mantendo ${keepLast} mais recentes)...`);

    const toRemove = backups.slice(keepLast);
    toRemove.forEach(backup => {
      const isDirectory = fs.statSync(backup.path).isDirectory();
      if (isDirectory) {
        fs.rmSync(backup.path, { recursive: true, force: true });
      } else {
        fs.unlinkSync(backup.path);
      }
      console.log(`  ✅ Removido: ${backup.name}`);
    });
  }
};

/**
 * Executa o backup
 */
const runBackup = async () => {
  try {
    console.log('💾 Iniciando backup do MongoDB...\n');
    console.log('━'.repeat(50));

    // Prepara diretórios
    const backupDir = ensureBackupDir();
    const backupName = generateBackupFilename();

    // Executa mongodump
    const backupPath = await runMongoDump(backupDir, backupName);

    // Compacta backup
    const finalPath = await compressBackup(backupPath);

    console.log('━'.repeat(50));
    console.log('\n✅ Backup concluído com sucesso!');
    console.log(`📂 Local: ${finalPath}\n`);

    // Lista backups existentes
    listBackups(backupDir);

    // Limpa backups antigos
    cleanOldBackups(backupDir);

    console.log('\n✅ Processo finalizado!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante o backup:', error);
    process.exit(1);
  }
};

// Verifica se mongodump está instalado
exec('mongodump --version', (error) => {
  if (error) {
    console.error('❌ ERRO: mongodump não está instalado');
    console.log('📌 Instale o MongoDB Database Tools:');
    console.log('   https://www.mongodb.com/try/download/database-tools');
    process.exit(1);
  } else {
    runBackup();
  }
});
