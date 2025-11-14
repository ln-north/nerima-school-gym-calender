const fs = require('fs');
const { nanoid } = require('nanoid');

// WebFetchから取得した実データ
const rawData = {
  "events": [
    {
      "school": "旭丘小学校",
      "dates": [
        { "date": "2025-11-02", "start_time": "14:00", "end_time": "16:00", "activities": ["卓球"] },
        { "date": "2025-11-23", "start_time": "14:00", "end_time": "17:00", "activities": ["卓球"] },
        { "date": "2025-11-30", "start_time": "14:00", "end_time": "16:00", "activities": ["卓球"] }
      ]
    },
    {
      "school": "小竹小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-07", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-25", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] }
      ]
    },
    {
      "school": "豊玉小学校",
      "dates": [
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] }
      ]
    },
    {
      "school": "早宮小学校",
      "dates": [
        { "date": "2025-11-01", "start_time": "19:00", "end_time": "21:00", "activities": ["インディアカ"] },
        { "date": "2025-11-22", "start_time": "19:00", "end_time": "21:00", "activities": ["インディアカ"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-29", "start_time": "19:00", "end_time": "21:00", "activities": ["インディアカ"] }
      ]
    },
    {
      "school": "開進第一小学校",
      "dates": [
        { "date": "2025-11-03", "start_time": "18:00", "end_time": "20:30", "activities": ["キャッチバレー", "バドミントン"] },
        { "date": "2025-11-04", "start_time": "18:00", "end_time": "20:30", "activities": ["卓球", "バドミントン"] },
        { "date": "2025-11-09", "start_time": "17:30", "end_time": "20:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "開進第四小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-07", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] }
      ]
    },
    {
      "school": "仲町小学校",
      "dates": [
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-21", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] }
      ]
    },
    {
      "school": "南町小学校",
      "dates": [
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "パドルテニス"] },
        { "date": "2025-11-09", "start_time": "13:00", "end_time": "15:00", "activities": ["パドルテニス"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["テニス"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-16", "start_time": "15:00", "end_time": "17:00", "activities": ["パドルテニス"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["テニス"] },
        { "date": "2025-11-18", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "パドルテニス"] }
      ]
    },
    {
      "school": "北町西小学校",
      "dates": [
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-07", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-09", "start_time": "12:00", "end_time": "14:00", "activities": ["バレーボール"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-14", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-16", "start_time": "12:00", "end_time": "14:00", "activities": ["バレーボール"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-21", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] }
      ]
    },
    {
      "school": "練馬小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス"] },
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] }
      ]
    },
    {
      "school": "練馬第三小学校",
      "dates": [
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-14", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-18", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-21", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-25", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] }
      ]
    },
    {
      "school": "豊渓小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-12", "start_time": "18:30", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-18", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-25", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-26", "start_time": "18:30", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "旭町小学校",
      "dates": [
        { "date": "2025-11-03", "start_time": "18:30", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-12", "start_time": "18:30", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-15", "start_time": "18:00", "end_time": "21:00", "activities": ["ミニテニス"] }
      ]
    },
    {
      "school": "光が丘四季の香小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] }
      ]
    },
    {
      "school": "光が丘春の風小学校",
      "dates": [
        { "date": "2025-11-01", "start_time": "18:00", "end_time": "20:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "光が丘夏の雲小学校",
      "dates": [
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン", "卓球"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-20", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン", "卓球"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン", "卓球"] }
      ]
    },
    {
      "school": "光が丘秋の陽小学校",
      "dates": [
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["軽スポーツ"] }
      ]
    },
    {
      "school": "石神井小学校",
      "dates": [
        { "date": "2025-11-02", "start_time": "14:00", "end_time": "16:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "インディアカ"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "インディアカ"] },
        { "date": "2025-11-16", "start_time": "14:00", "end_time": "16:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "石神井西小学校",
      "dates": [
        { "date": "2025-11-02", "start_time": "10:00", "end_time": "12:00", "activities": ["バドミントン"] },
        { "date": "2025-11-08", "start_time": "13:00", "end_time": "15:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-15", "start_time": "13:00", "end_time": "15:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-16", "start_time": "10:00", "end_time": "12:00", "activities": ["バドミントン"] },
        { "date": "2025-11-22", "start_time": "13:00", "end_time": "15:00", "activities": ["ラケットテニス"] },
        { "date": "2025-11-23", "start_time": "10:00", "end_time": "12:00", "activities": ["バドミントン"] },
        { "date": "2025-11-29", "start_time": "13:00", "end_time": "15:00", "activities": ["ラケットテニス"] }
      ]
    },
    {
      "school": "石神井台小学校",
      "dates": [
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "上石神井北小学校",
      "dates": [
        { "date": "2025-11-03", "start_time": "19:00", "end_time": "21:00", "activities": ["ソフトバレーボール"] },
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["ソフトバレーボール"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["ソフトバレーボール"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "光和小学校",
      "dates": [
        { "date": "2025-11-24", "start_time": "13:00", "end_time": "15:00", "activities": ["初心者卓球教室"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "大泉第一小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] }
      ]
    },
    {
      "school": "大泉第四小学校",
      "dates": [
        { "date": "2025-11-01", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "バドミントン"] },
        { "date": "2025-11-03", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "バドミントン"] },
        { "date": "2025-11-08", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "バドミントン"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "バドミントン"] }
      ]
    },
    {
      "school": "大泉西小学校",
      "dates": [
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-22", "start_time": "14:00", "end_time": "16:00", "activities": ["バレーボール"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] }
      ]
    },
    {
      "school": "大泉南小学校",
      "dates": [
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-14", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-15", "start_time": "16:00", "end_time": "18:00", "activities": ["卓球"] },
        { "date": "2025-11-20", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-21", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-22", "start_time": "16:00", "end_time": "18:00", "activities": ["卓球"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-29", "start_time": "16:00", "end_time": "18:00", "activities": ["卓球"] }
      ]
    },
    {
      "school": "大泉学園緑小学校",
      "dates": [
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["ソフトバレーボール", "ラケットテニス"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] },
        { "date": "2025-11-24", "start_time": "19:00", "end_time": "21:00", "activities": ["ソフトバレーボール", "ラケットテニス"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["バレーボール"] }
      ]
    },
    {
      "school": "大泉学園桜小学校",
      "dates": [
        { "date": "2025-11-01", "start_time": "18:30", "end_time": "20:30", "activities": ["バスケットボール"] },
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス"] },
        { "date": "2025-11-08", "start_time": "18:30", "end_time": "20:30", "activities": ["バスケットボール"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス"] },
        { "date": "2025-11-15", "start_time": "18:30", "end_time": "20:30", "activities": ["バスケットボール"] },
        { "date": "2025-11-18", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス"] },
        { "date": "2025-11-22", "start_time": "18:30", "end_time": "20:30", "activities": ["バスケットボール"] },
        { "date": "2025-11-25", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス"] }
      ]
    },
    {
      "school": "橋戸小学校",
      "dates": [
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-22", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン", "ミニバスケット"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球"] },
        { "date": "2025-11-29", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン", "ミニバスケット"] }
      ]
    },
    {
      "school": "南が丘小学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["インディアカ"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["インディアカ"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] }
      ]
    },
    {
      "school": "豊玉中学校",
      "dates": [
        { "date": "2025-11-01", "start_time": "19:00", "end_time": "21:00", "activities": ["フットサル"] },
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-15", "start_time": "19:00", "end_time": "21:00", "activities": ["フットサル"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] }
      ]
    },
    {
      "school": "開進第三中学校",
      "dates": [
        { "date": "2025-11-04", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-06", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-11", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-13", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-18", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-20", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-25", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] },
        { "date": "2025-11-27", "start_time": "19:00", "end_time": "21:00", "activities": ["硬式テニス"] }
      ]
    },
    {
      "school": "大泉中学校",
      "dates": [
        { "date": "2025-11-03", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス", "バドミントン"] },
        { "date": "2025-11-05", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス", "バドミントン"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス", "バドミントン"] },
        { "date": "2025-11-12", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス", "バドミントン"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス", "バドミントン"] },
        { "date": "2025-11-19", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "ラケットテニス", "バドミントン"] },
        { "date": "2025-11-24", "start_time": "19:00", "end_time": "21:00", "activities": ["ラケットテニス", "バドミントン"] },
        { "date": "2025-11-26", "start_time": "19:00", "end_time": "21:00", "activities": ["卓球", "バドミントン"] }
      ]
    },
    {
      "school": "関中学校",
      "dates": [
        { "date": "2025-11-07", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-09", "start_time": "12:30", "end_time": "14:30", "activities": ["バレーボール"] },
        { "date": "2025-11-10", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-14", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-17", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-21", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-23", "start_time": "12:30", "end_time": "14:30", "activities": ["バレーボール"] },
        { "date": "2025-11-24", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-28", "start_time": "19:00", "end_time": "21:00", "activities": ["バドミントン"] },
        { "date": "2025-11-30", "start_time": "12:30", "end_time": "15:30", "activities": ["バレーボール"] }
      ]
    }
  ]
};

// 変換処理
const events = [];
const schoolsSet = new Set();
const sportsSet = new Set();

rawData.events.forEach(schoolData => {
  const schoolName = `練馬区立${schoolData.school}`;
  schoolsSet.add(schoolName);

  schoolData.dates.forEach(dateEntry => {
    dateEntry.activities.forEach(sport => sportsSet.add(sport));

    events.push({
      id: nanoid(),
      schoolName: schoolName,
      date: dateEntry.date,
      startTime: dateEntry.start_time,
      endTime: dateEntry.end_time,
      sports: dateEntry.activities,
      url: "https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/taiikukannkaihou3.html"
    });
  });
});

const schools = Array.from(schoolsSet).map((name, index) => ({
  id: `school-${index + 1}`,
  name: name
}));

const sports = Array.from(sportsSet).map((name, index) => ({
  id: `sport-${index + 1}`,
  name: name
}));

const scheduleData = {
  events: events,
  schools: schools,
  sports: sports,
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync('./public/data/schedule.json', JSON.stringify(scheduleData, null, 2));

console.log(`Successfully converted ${events.length} events from ${schools.length} schools with ${sports.length} sports`);
