import * as tsj from 'ts-json-schema-generator'
import * as fs from 'fs'

function buildSchema(type: string, props: { title: string, description: string }, path: string, outputPath: string): void {
	let schema = tsj.createGenerator({
		path,
		type,
		expose: 'all',
		topRef: true,
		jsDoc: 'extended',
	}).createSchema(type)
	schema = { ...schema, ...props }
	const schemaString = JSON.stringify(schema, null, 2)
	fs.writeFileSync(outputPath, schemaString)
}

buildSchema('Library', {
	title: 'HydraScript Library',
	description: 'A collection of HydraScript API definitions',
}, './shared/src/index.ts', './schema/out/hydra-lib.schema.json')

buildSchema('Script', {
	title: 'HydraScript',
	description: 'A HydraScript script definition',
}, './shared/src/index.ts', './schema/out/hydra.schema.json')
