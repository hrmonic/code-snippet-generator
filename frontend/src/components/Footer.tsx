export function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left text-gray-600 dark:text-gray-400 text-sm">
            Fait avec ❤️ par{' '}
            <a
              href="https://github.com/hrmonic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors dark:text-primary-400 dark:hover:text-primary-300"
            >
              @hrmonic
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <a
              href="https://github.com/hrmonic/code-snippet-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors dark:hover:text-primary-400"
            >
              Documentation
            </a>
            <a
              href="https://github.com/hrmonic/code-snippet-generator/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors dark:hover:text-primary-400"
            >
              Signaler un bug
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
