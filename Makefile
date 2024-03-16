install:
	rm -rf yarn.lock node_modules
	git pull
	yarn install
	yarn build
	npm install -g serve
	pm2 serve build 3001 --spa --name admin
build-source:
	rm -rf yarn.lock
	git pull
	yarn install
	yarn build
	pm2 restart admin
