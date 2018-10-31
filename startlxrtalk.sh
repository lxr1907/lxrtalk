#!/bin/bash
forever start /root/lxrtalk/webSocket.js
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
