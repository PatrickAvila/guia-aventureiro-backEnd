/*
 * Migra dados entre dois clusters MongoDB mantendo _id e sem apagar dados do destino.
 * Uso:
 *   OLD_MONGO_URI="..." NEW_MONGO_URI="..." node scripts/migrateMongoData.js
 */

const { MongoClient } = require('mongodb');

const OLD_MONGO_URI = process.env.OLD_MONGO_URI;
const NEW_MONGO_URI = process.env.NEW_MONGO_URI || process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'guia_aventureiro_db';

if (!OLD_MONGO_URI || !NEW_MONGO_URI) {
  console.error('Erro: defina OLD_MONGO_URI e NEW_MONGO_URI (ou MONGO_URI).');
  process.exit(1);
}

const BATCH_SIZE = 500;

async function run() {
  const sourceClient = new MongoClient(OLD_MONGO_URI);
  const targetClient = new MongoClient(NEW_MONGO_URI);

  try {
    console.log('Conectando no cluster origem...');
    await sourceClient.connect();
    console.log('Conectando no cluster destino...');
    await targetClient.connect();

    const sourceDb = sourceClient.db(DB_NAME);
    const targetDb = targetClient.db(DB_NAME);

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

    const names = collections.map((c) => c.name).filter((name) => !name.startsWith('system.'));

    if (names.length === 0) {
      console.log(`Nenhuma collection encontrada em ${DB_NAME}.`);
      return;
    }

    console.log(`Collections encontradas (${names.length}): ${names.join(', ')}`);

    for (const name of names) {
      const sourceCol = sourceDb.collection(name);
      const targetCol = targetDb.collection(name);

      const total = await sourceCol.countDocuments();
      console.log(`\nMigrando ${name} (${total} docs)...`);

      const cursor = sourceCol.find({});
      let ops = [];
      let processed = 0;
      let upserted = 0;
      let modified = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        ops.push({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true,
          },
        });

        if (ops.length >= BATCH_SIZE) {
          const result = await targetCol.bulkWrite(ops, { ordered: false });
          processed += ops.length;
          upserted += result.upsertedCount || 0;
          modified += result.modifiedCount || 0;
          ops = [];
          process.stdout.write(`  ${processed}/${total}...\r`);
        }
      }

      if (ops.length > 0) {
        const result = await targetCol.bulkWrite(ops, { ordered: false });
        processed += ops.length;
        upserted += result.upsertedCount || 0;
        modified += result.modifiedCount || 0;
      }

      console.log(`  ${processed}/${total} concluido.`);
      console.log(`  Upserts: ${upserted} | Updates: ${modified}`);
    }

    console.log('\nMigracao finalizada com sucesso.');
  } catch (error) {
    console.error('\nErro durante migracao:', error.message);
    process.exitCode = 1;
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

run();
