CREATE DATABASE IF NOT EXISTS mediqueue_db;
USE mediqueue_db;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `role` enum('pasien','petugas') NOT NULL DEFAULT 'pasien',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

CREATE TABLE `queues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `nomor_antrian` varchar(20) NOT NULL,
  `poli` varchar(50) NOT NULL,
  `keluhan` text NOT NULL,
  `status` enum('menunggu','dipanggil','selesai') NOT NULL DEFAULT 'menunggu',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `queues_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
