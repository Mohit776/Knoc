import os, socket, ssl, struct

def resolve_all_via_google_dns(hostname):
    ips = []
    try:
        tx_id = os.urandom(2)
        flags = b'\x01\x00'
        counts = b'\x00\x01\x00\x00\x00\x00\x00\x00'
        qname = b''
        for part in hostname.encode().split(b'.'):
            qname += bytes([len(part)]) + part
        qname += b'\x00'
        query = tx_id + flags + counts + qname + b'\x00\x01\x00\x01'
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(3)
        sock.sendto(query, ('8.8.8.8', 53))
        data, _ = sock.recvfrom(1024)
        sock.close()
        offset = 12
        while data[offset] != 0:
            offset += data[offset] + 1
        offset += 5
        an_count = struct.unpack('!H', data[6:8])[0]
        for _ in range(an_count):
            if data[offset] & 0xC0 == 0xC0:
                offset += 2
            else:
                while data[offset] != 0:
                    offset += data[offset] + 1
                offset += 1
            rtype = struct.unpack('!H', data[offset:offset+2])[0]
            offset += 8
            rdlen = struct.unpack('!H', data[offset:offset+2])[0]
            offset += 2
            if rtype == 1 and rdlen == 4:
                ips.append(socket.inet_ntoa(data[offset:offset+4]))
            offset += rdlen
    except Exception as e:
        print(f"DNS resolve error: {e}")
    return ips

host = "xvnqeryjbtjwzpmrpztu.supabase.co"
all_ips = resolve_all_via_google_dns(host)
print(f"Google DNS resolved {host} -> {all_ips}")

# Test each IP
for ip in all_ips:
    print(f"\nTesting {ip}...")
    try:
        ctx = ssl.create_default_context()
        sock = socket.create_connection((ip, 443), timeout=5)
        ssock = ctx.wrap_socket(sock, server_hostname=host)
        print(f"  TLS handshake OK with {ip}")
        ssock.close()

        # Now patch and test Supabase
        _orig = socket.getaddrinfo
        def _patched(h, port, family=0, type_=0, proto=0, flags=0):
            if isinstance(h, str) and h == host:
                return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (ip, port))]
            return _orig(h, port, family, type_, proto, flags)
        socket.getaddrinfo = _patched

        from dotenv import load_dotenv
        load_dotenv()
        from supabase import create_client
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_ANON_KEY"]
        client = create_client(url, key)
        result = client.table("qr_codes").select("*").limit(1).execute()
        print(f"  SUPABASE SUCCESS with {ip}! Got {len(result.data)} row(s)")
        break
    except Exception as e:
        print(f"  FAILED with {ip}: {e}")
        # Restore original getaddrinfo for next attempt
        socket.getaddrinfo = _orig
