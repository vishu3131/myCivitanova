import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProblemReportSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Segnalazione Problemi e Forum
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestisci le segnalazioni degli utenti e partecipa al forum della community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/problem-reports" passHref>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-5 h-5" />
            Segnala un Problema
          </motion.a>
        </Link>
        <Link href="/community" passHref>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            Vai al Forum
          </motion.a>
        </Link>
      </div>
    </motion.div>
  );
}
